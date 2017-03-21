from strategies.strategy_base import StrategyBase
from assets import *

'''
This is the implementation of the guyton klinger strategy
'''
class GuytonKlinger(StrategyBase):
    def __init__(self, initialPercent, simulationLength):
        self.initialPercent = initialPercent
        self.currentPercent = initialPercent
        self.simulationLength = simulationLength

    def getInitialWithDrawal(self):
        super(GuytonKlinger, self).getInitialWithDrawal()
        return self.initialWithdrawal

    def reset(self, portfolio):
        super(GuytonKlinger, self).reset(portfolio)
        self.portfolio = portfolio
        self.initialWithdrawal = portfolio.value * self.initialPercent
        self.cashReserves = 0.0
        self.year = 0.0
        self.previousValue = self.getPortfolioValue()
        self.initialAllocation = portfolio.allocation

    def withdraw(self, inflationRate, numPeriodsPerYear):
        super(GuytonKlinger, self).withdraw(inflationRate, numPeriodsPerYear)
        self.year += 1.0 / numPeriodsPerYear # TODO double check edge cases around this as it applies to (CPR)

        # Inflation Rule (IR)
        if self.getPortfolioValue() < self.previousValue and self.currentPercent * min(inflationRate, 1.06) < self.initialWithdrawal:
            self.currentPercent = self.currentPercent * min(inflationRate, 1.06)

        # Capital Preservation Rule (CPR)
        if self.currentPercent > 1.2 * self.initialPercent:
            if self.simulationLength - self.year > 15:
                self.currentPercent = self.currentPercent * .9

        # Prosperity Rule (PR)
        if self.currentPercent < .8 * self.initialPercent:
            self.currentPercent = self.currentPercent * 1.1

        # Portfolio Management Rule (PMR)
        # Other half of this rule in grow(...)
        desiredWithdrawal = self.portfolio.value * self.currentPercent / numPeriodsPerYear
        actualWithdrawal = 0.0
        if desiredWithdrawal > self.cashReserves:
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

    def grow(self, monthGrowth):
        super(GuytonKlinger, self).grow(monthGrowth)
        # PMR other half, rebalance excess into cash

        # TODO I THINK THERE IS A DIFFERENT DECISION HERE IF THERE IS A NEGATIVE RETURN
        minPerformance = float("inf")
        for i in range(0, len(monthGrowth)):
            if monthGrowth[i] < minPerformance:
                minPerformance = monthGrowth[i]

        newAssets = []
        for i in range(0, len(monthGrowth)):
            self.cashReserves += self.portfolio.allocation[i] * self.portfolio.value * (monthGrowth[i] - minPerformance)
            newAssets.append(minPerformance)

        monthGrowth = Assets(newAssets)

        self.portfolio.grow(monthGrowth)
