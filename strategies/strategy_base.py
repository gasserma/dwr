from assets import Assets
from portfolio import Portfolio
from abc import ABCMeta, abstractmethod

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

