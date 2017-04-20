'''
https://www.bogleheads.org/forum/viewtopic.php?t=120430
'''

from strategies.strategy_base import YearlyStrategyBase

class Vpw(YearlyStrategyBase):
    def __init__(self, expectedRealReturn, simulationLength, drawDownPercentage):
        self.expectedRealReturn = expectedRealReturn
        self.simulationLength = simulationLength + 1 # dealing with inclusive bounds of simulation
        self.drawDownPercentage = drawDownPercentage

    def getInitialWithDrawal(self):
        return self.initialAmount

    def getCurrentWithdrawalAmount(self):
        return self.currentAmount

    def yearBaseReset(self, portfolio):
        self.portfolio = portfolio
        self.initialAmount = self.yearGetPortfolioValue() * .049533
        self.initialPortfolio = self.yearGetPortfolioValue()
        self.initialRate = self.initialAmount / self.yearGetPortfolioValue()
        self.year = 0

    def yearWithdraw(self, inflationRate):
        withdrawal = self.annuityPayment()
        candidateWithdrawalRate = withdrawal / self.yearGetPortfolioValue()

        # This is the increasing cap
        withdrawalRate = min(candidateWithdrawalRate, self.initialRate * 1.20)

        actualWithdrawal = withdrawalRate * self.yearGetPortfolioValue() * self.drawDownPercentage
        actualWithdrawal += (1.0 - self.drawDownPercentage) * self.expectedRealReturn * self.yearGetPortfolioValue()

        self.year += 1
        self.currentAmount = actualWithdrawal
        return self.portfolio.withdraw(actualWithdrawal)

    def annuityPayment(self):
        # http://www.financeformulas.net/Annuity_Payment_Formula.html
        numerator = self.expectedRealReturn * self.initialPortfolio
        denominator = (1.0 - ((1.0 + self.expectedRealReturn)**(-1.0*(self.simulationLength - self.year + 1))))
        payment = numerator / denominator
        return payment

    def yearGetPortfolioValue(self):
        return self.portfolio.value

    def yearGrow(self, yearGrowth):
        self.portfolio.grow(yearGrowth)