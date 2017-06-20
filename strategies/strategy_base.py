from abc import ABCMeta, abstractmethod

from assets import Assets

from portfolio import Portfolio

'''
This class is of dubious utility...
Its most a verbose piece of documentation about what it takes to implement a withdrawal rate strategy.
'''
class StrategyBase:
    __metaclass__ = ABCMeta

    @abstractmethod
    def getInitialWithDrawal(self): pass

    @abstractmethod
    def reset(self, portfolio): pass

    @abstractmethod
    def withdraw(self, inflationRate, numPeriodsPerYear): pass

    @abstractmethod
    def getPortfolioValue(self): pass

    @abstractmethod
    def grow(self, monthGrowth): pass

class YearlyStrategyBase(StrategyBase):
    def reset(self, portfolio):
        self.month = -1
        self.yearBaseReset(portfolio)
        self.yearGrowthAccumulator = Assets.getMultiplicationUnitAssets()
        self.cash = 0

    def grow(self, monthGrowth):
        if self.month % 12 == 0: # Do all this first to get the first iteration right.
            self.yearGrow(self.yearGrowthAccumulator)
            self.yearGrowthAccumulator = Assets.getMultiplicationUnitAssets()
        self.yearGrowthAccumulator = self.yearGrowthAccumulator * monthGrowth

    def withdraw(self, inflationRate, numPeriodsPerYear):
        self.month += 1
        if numPeriodsPerYear != 12:
            raise RuntimeError

        if self.month % 12 == 0:
            self.cash = self.yearWithdraw(inflationRate) # inflation rates are already yearly

        currWithdrawal = self.getCurrentWithdrawalAmount() / 12
        if self.cash - currWithdrawal < 0:
            retval = self.cash
            self.cash = 0
            return retval

        self.cash -= currWithdrawal
        return currWithdrawal

    def getPortfolioValue(self):
        return self.yearGetPortfolioValue() + self.cash

    @abstractmethod
    def yearGetPortfolioValue(self): pass

    @abstractmethod
    def yearWithdraw(self, inflationRate): pass

    @abstractmethod
    def getCurrentWithdrawalAmount(self): pass

    @abstractmethod
    def yearGrow(self, yearGrowth): pass

    @abstractmethod
    def yearBaseReset(self, portfolio): pass