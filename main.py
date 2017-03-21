from strategies.test_trinity import *
from strategies.guyton_klinger import *

'''
This is currently running on Python 3.5.1
'''
retirementLength = 30
initialPortfolio = 1 * 1000 * 1000

result = runSimulation(
    retirementLength,
    initialPortfolio,
    .02 * initialPortfolio,
    (
        (GuytonKlinger(.04, retirementLength), Assets(.5, .5), 1.0),
    ),
    1926,
    2010
)

print(result)
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