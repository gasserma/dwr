from strategies.strategy_base import *
from assets import *

'''
This is the implementation of the guyton klinger strategy
'''
class GuytonKlinger(YearlyStrategyBase):
    def __init__(self, initialAmount, simulationLength):
        self.initialAmount = initialAmount
        self.simulationLength = simulationLength

    def getInitialWithDrawal(self):
        return self.initialAmount

    def getCurrentWithdrawalAmount(self):
        return self.currentAmount

    def yearBaseReset(self, portfolio):
        self.portfolio = portfolio
        self.initialRate = self.initialAmount / portfolio.value
        self.cashReserves = 0.0
        self.year = 0.0
        self.previousValue = self.getPortfolioValue()
        self.initialAllocation = portfolio.allocation
        self.previousInflation = 1.0
        self.currentAmount = self.initialAmount

    def currentRate(self):
        return self.currentAmount / self.getPortfolioValue()

    def yearWithdraw(self, inflationRate):
        marginalInflation = inflationRate / self.previousInflation
        self.previousInflation = inflationRate
        self.year += 1

        if self.getPortfolioValue() == 0.0:
            return 0.0

        # Inflation Rule (IR)
        if self.getPortfolioValue() > self.previousValue * marginalInflation \
                or self.currentAmount * min(marginalInflation, 1.06) < self.initialAmount * inflationRate:
            self.currentAmount = self.currentAmount * min(marginalInflation, 1.06)

        # Capital Preservation Rule (CPR)
        if self.currentRate() > 1.2 * self.initialRate:
            if self.simulationLength - self.year > 15:
                self.currentAmount = self.currentAmount * .9

        # Prosperity Rule (PR)
        if self.currentRate() < .8 * self.initialRate:
            self.currentAmount = self.currentAmount * 1.1

        # Portfolio Management Rule (PMR)
        # Other half of this rule in grow(...)
        desiredWithdrawal = self.currentAmount
        actualWithdrawal = 0.0
        if desiredWithdrawal < self.cashReserves:
            self.cashReserves -= desiredWithdrawal
            actualWithdrawal = desiredWithdrawal
        elif self.cashReserves > 0.0:
            actualWithdrawal += self.cashReserves
            self.cashReserves = 0.0
            actualWithdrawal = self.portfolio.withdraw(desiredWithdrawal - actualWithdrawal)
        else:
            actualWithdrawal = self.portfolio.withdraw(desiredWithdrawal)

        self.previousValue = self.getPortfolioValue()
        return actualWithdrawal

    def getPortfolioValue(self):
        super(GuytonKlinger, self).getPortfolioValue()
        return self.portfolio.value + self.cashReserves

    def yearGrow(self, yearGrowth):
        # PMR other half, rebalance excess into cash

        # this is stupid, and right now it seems like it is as described by Guyton and Klinger.
        # you can screw this whole strategy up by having a teeny tiny sliver
        # of your portfolio dedicated to an asset class that performs terribly
        if self.portfolio.value * self.portfolio.allocation * yearGrowth > self.portfolio.value:
            minPerformance = min(yearGrowth)

            newAssets = []
            for i in range(0, len(yearGrowth)):
                self.cashReserves += self.portfolio.allocation[i] * self.portfolio.value * (yearGrowth[i] - minPerformance)
                newAssets.append(minPerformance)

            yearGrowth = Assets(newAssets)

        self.portfolio.grow(yearGrowth)
