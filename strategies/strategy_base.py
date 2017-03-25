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
    def reset(self, portfolio):
        if not isinstance(portfolio, Portfolio):
            raise RuntimeWarning

    @abstractmethod
    def withdraw(self, inflationRate, numPeriodsPerYear): pass

    @abstractmethod
    def getPortfolioValue(self): pass

    @abstractmethod
    def grow(self, monthGrowth):
        if not isinstance(monthGrowth, Assets):
            raise RuntimeWarning

class YearlyStrategyBase(StrategyBase):
    def reset(self, portfolio):
        self.month = -1
        self.yearBaseReset(portfolio)
        self.yearGrowthAccumulator = Assets.getMultiplicationUnitAssets()

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
            self.yearWithdraw(inflationRate) # inflation rates are already yearly

        return self.getCurrentWithdrawalAmount() /12.0

    @abstractmethod
    def yearWithdraw(self, inflationRate): pass

    @abstractmethod
    def getCurrentWithdrawalAmount(self): pass

    @abstractmethod
    def yearGrow(self, yearGrowth):
        if not isinstance(yearGrowth, Assets):
            raise RuntimeWarning

    @abstractmethod
    def yearBaseReset(self, portfolio):
        if not isinstance(portfolio, Portfolio):
            raise RuntimeWarning