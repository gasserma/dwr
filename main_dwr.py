from assets import Assets
from simulation import runSimulation
from strategies.guyton_klinger import GuytonKlinger

'''
This is currently running on Python 3.5.1
'''
retirementLength = 30
initialPortfolio = 1 * 1000 * 1000

result = runSimulation(
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
#for i in range(0, result.iterations):
    #result.drawMe(i)

'''
print("\n\n\n")


result = runSimulation(
    retirementLength,
    initialPortfolio,
    .04 * initialPortfolio,
    (
        (ConstantWithdrawalAmountStrategy(.04 * initialPortfolio), Assets(.5, .5), 1.0),
    ),
    1926,
    2010
)


print(result)
print("\n\n\n")

result = runSimulation(
    retirementLength,
    initialPortfolio,
    .04 * initialPortfolio * .50,
    (
        (ConstantPercentWithdrawalStrategy(.04), Assets(1.0, 0.0), 1.0),
    ),
    1926,
    2010
)

print(result)
print("\n\n\n")

failureThreshhold = initialPortfolio * .02 # $20,000
result = runSimulation(
    retirementLength,
    initialPortfolio,
    failureThreshhold,
    (
        (ConstantWithdrawalAmountStrategy(initialPortfolio * .04 * .5), Assets(.5, .5), .5),
        (ConstantPercentWithdrawalStrategy(.04), Assets(1.0, 0.0), .5)
    ),
    1926,
    2010
)

result.drawMe()

print(result)
'''