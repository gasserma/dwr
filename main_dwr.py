from assets import Assets
from simulator import runSimulation
from strategies.guyton_klinger import GuytonKlinger

"""
This is just a playground file. Useful for running the profiler, first attempt at running the code, etc.
"""
retirementLength = 30
initialPortfolio = 1 * 1000 * 1000

result = runSimulation(
    retirementLength,
    initialPortfolio,
    .05 * initialPortfolio * .5,
    (
        (GuytonKlinger(.05 * initialPortfolio, True, True, True, True, retirementLength), Assets(.5, .5), 1.0),
    ),
    1926,
    2009
)

result.getSimResults()

print(result)