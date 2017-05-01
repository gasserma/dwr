from assets import Assets
from simulator import run_simulation
from strategies.guyton_klinger import GuytonKlinger

"""
This is just a playground file. Useful for running the profiler, first attempt at running the code, etc.
"""
retirementLength = 30
initialPortfolio = 1 * 1000 * 1000

result = run_simulation(
    retirementLength,
    initialPortfolio,
    .05 * initialPortfolio * .5,
    (
        (GuytonKlinger(.05 * initialPortfolio, retirementLength), Assets(.5, .5), 1.0),
    ),
    1926,
    2010
)

result.getSimResults()

print(result)