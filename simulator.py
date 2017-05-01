from assets import Assets
from helpers import *
from market_data import getInflation
from portfolio import Portfolio
from simulation import Simulation


def run_simulation(
        length,
        initial_portfolio,
        failure_threshold,
        init_strategies,
        min_sim_year,
        max_sim_year,
        ignore_inflation=False,
        test_callback=None):
    """ Runs a simulation. This is the inner loop to this entire project.

    :param length: The length of the simulation. Inclusive on both sides, so passing in
                two here would cause 36 months of growth and withdrawal cycles.
    :param initial_portfolio: The initial portfolio. This is a Portfolio class instance.
    :param failure_threshold: Assert a failure if a withdrawal ever falls below this amount.
    :param init_strategies: A tuple of the various strategies. Each strategy is also a tuple of the form
                (Strategy object, Assets object, weight)
                The strategy object is an instantiation of a particular strategy.
                The Assets are the initial asset allocation.
                The weights of all the (s, a, w) in the initStrategies tuple must sum to 1.0.
    :param min_sim_year: The inclusive beginning year of the simulation.
    :param max_sim_year: The inclusive ending year of the simulation.
    :param ignore_inflation: Self explanatory. Worth noting that the web interface never sets this as true.
                It is basically only used for tests. Defaults to False.
    :param test_callback: Provided by tests as a hook for assertions. Defaults to null.
    :return: A Simulation class instance. This contains various results and stored data.
    """
    simulation = Simulation(min_sim_year, max_sim_year, length, ignore_inflation, initial_portfolio, failure_threshold)
    strategies = []
    init_portfolios = []
    total_weight = 0.0
    for s in init_strategies:
        strategies.append(s[0])
        init_portfolios.append(Portfolio(s[1], s[2] * initial_portfolio))
        total_weight += s[2]

    if not isclose(total_weight, 1.0):
        raise RuntimeError("Your weights don't add up to 1.0")

    simulation_iteration = 0
    # why 2? python and last year of the simulation are both exclusive
    for start_year in range(min_sim_year, max_sim_year - length + 2):
        for i in range(0, len(strategies)):
            portfolio = init_portfolios[i].copy()
            strategies[i].reset(portfolio)

        candidate_failure_year = None
        inflation_rate = None
        try:
            underflow = 0.0
            overflow = 0.0
            for simulation_year in range(start_year, start_year + length + 1):
                candidate_failure_year = simulation_year
                inflation_rate = getInflation(start_year - 1, simulation_year - 1)
                if ignore_inflation:
                    inflation_rate = 1.0
                fail_min = failure_threshold * inflation_rate
                months_per_year = 12
                for month in range(1, months_per_year + 1):
                    month_growth = Assets.getMarketReturns(simulation_year, month)
                    if test_callback:
                        pv = sum(s.getPortfolioValue() for s in strategies) / inflation_rate
                        test_callback["pre"](pv, month_growth, strategies)

                    actual_withdrawal = 0.0
                    for i in range(0, len(strategies)):
                        actual_withdrawal += strategies[i].withdraw(inflation_rate, months_per_year)
                        strategies[i].grow(month_growth)
                    current_portfolio_value = sum(s.getPortfolioValue() for s in strategies) / inflation_rate
                    simulation.recordData(
                        simulation_iteration,
                        simulation_year,
                        month,
                        actual_withdrawal / inflation_rate,
                        current_portfolio_value)
                    diff = actual_withdrawal - (
                        sum(s.getInitialWithDrawal() / months_per_year for s in strategies) * inflation_rate)

                    if test_callback:
                        test_callback["post"](current_portfolio_value, actual_withdrawal / inflation_rate)

                    if lessthanorequal(actual_withdrawal, fail_min / months_per_year):
                        raise StopIteration
                    if diff < 0:
                        underflow += diff / inflation_rate
                    else:
                        overflow += diff / inflation_rate
            simulation.recordSuccess()
        except StopIteration:
            simulation.recordFailure(start_year, candidate_failure_year)
        finally:
            simulation.endPortfolioValue.append(sum(s.getPortfolioValue() for s in strategies) / inflation_rate)
            simulation.underflow.append(underflow)
            simulation.overflow.append(overflow)
            simulation.endRelativeInflation.append(inflation_rate)
            simulation_iteration += 1
    simulation.finalize()
    return simulation
