from assets import Assets
from helpers import *
from market_data import getInflation
from portfolio import Portfolio
from simulation import Simulation


def runSimulation(
        length,
        initialPortfolio,
        failureThreshold,
        initStrategies,
        minSimYear,
        maxSimYear,
        ignoreInfation=False,
        testCallback=None):
    """ Runs a simulation. This is the inner loop to this entire project.

    :param length: The length of the simulation. Inclusive on both sides, so passing in
                two here would cause 36 months of growth and withdrawal cycles.
    :param initialPortfolio: The initial portfolio. This is a Portfolio class instance.
    :param failureThreshold: Assert a failure if a withdrawal ever falls below this amount.
    :param initStrategies: A tuple of the various strategies. Each strategy is also a tuple of the form
                (Strategy object, Assets object, weight)
                The strategy object is an instantiation of a particular strategy.
                The Assets are the initial asset allocation.
                The weights of all the (s, a, w) in the initStrategies tuple must sum to 1.0.
    :param minSimYear: The inclusive beginning year of the simulation.
    :param maxSimYear: The inclusive ending year of the simulation.
    :param ignoreInfation: Self explanatory. Worth noting that the web interface never sets this as true.
                It is basically only used for tests. Defaults to False.
    :param testCallback: Provided by tests as a hook for assertions. Defaults to null.
    :return: A Simulation class instance. This contains various results and stored data.
    """
    simulation = Simulation(minSimYear, maxSimYear, length, ignoreInfation, initialPortfolio, failureThreshold)
    strategies = []
    initPortfolios = []
    totalWeight = 0.0
    for s in initStrategies:
        strategies.append(s[0])
        initPortfolios.append(Portfolio(s[1], s[2] * initialPortfolio))
        totalWeight += s[2]

    if not isclose(totalWeight, 1.0):
        raise RuntimeError("Your weights don't add up to 1.0")

    simulationIteration = 0
    # why 2? python and last year of the simulation are both exclusive
    for startYear in range(minSimYear, maxSimYear - length + 2):
        for i in range(0, len(strategies)):
            portfolio = initPortfolios[i].copy()
            strategies[i].reset(portfolio)

        candidateFailureYear = None
        inflationRate = None
        try:
            underflow = 0.0
            overflow = 0.0
            for simulationYear in range(startYear, startYear + length + 1):
                candidateFailureYear = simulationYear
                inflationRate = getInflation(startYear - 1, simulationYear - 1)
                if ignoreInfation:
                    inflationRate = 1.0
                failMin = failureThreshold * inflationRate
                monthsPerYear = 12
                for month in range(1, monthsPerYear + 1):
                    monthGrowth = Assets.getMarketReturns(simulationYear, month)
                    if testCallback:
                        pv = sum(s.getPortfolioValue() for s in strategies) / inflationRate
                        testCallback["pre"](pv, monthGrowth, strategies)

                    actualWithdrawal = 0.0
                    for i in range(0, len(strategies)):
                        actualWithdrawal += strategies[i].withdraw(inflationRate, monthsPerYear)
                        strategies[i].grow(monthGrowth)
                    currentPortfolioValue = sum(s.getPortfolioValue() for s in strategies) / inflationRate
                    simulation.recordData(
                        simulationIteration,
                        simulationYear,
                        month,
                        actualWithdrawal / inflationRate,
                        currentPortfolioValue)
                    diff = actualWithdrawal - (
                        sum(s.getInitialWithDrawal() / monthsPerYear for s in strategies) * inflationRate)

                    if testCallback:
                        testCallback["post"](currentPortfolioValue, actualWithdrawal / inflationRate)

                    if lessthanorequal(actualWithdrawal, failMin / monthsPerYear):
                        raise StopIteration
                    if diff < 0:
                        underflow += diff / inflationRate
                    else:
                        overflow += diff / inflationRate
            simulation.recordSuccess()
        except StopIteration:
            simulation.recordFailure(startYear, candidateFailureYear)
        finally:
            simulation.endPortfolioValue.append(sum(s.getPortfolioValue() for s in strategies) / inflationRate)
            simulation.underflow.append(underflow)
            simulation.overflow.append(overflow)
            simulation.endRelativeInflation.append(inflationRate)
            simulationIteration += 1
    simulation.finalize()
    return simulation
