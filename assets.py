import marketData
import math

'''
The point of this class is to stop you from having to write .stocks/.bonds/.gold etc everywhere
It inherits from Tuple, so its immutable. It overrides a bunch of operators so you can do nice things
like a * b and it will either apply a scalar across all assets or multiply all the individual assets across
Remember that context is important on these. It might represent a portfolio, or rates of return, etc.
'''
class Assets(tuple):
    STOCK_INDEX = 0
    BOND_INDEX = 1

    def __new__(cls, *args, **kwargs):
        return super(Assets, cls).__new__(cls, args, kwargs)

    def __new__(cls, *args):
        if len(args) == 1: #its already a list
            return super(Assets, cls).__new__(cls, args[0])
        seq = [x for x in args]
        return super(Assets, cls).__new__(cls, seq)

    def __mul__(self, other):
        if isinstance(other, Assets):
            return Assets(self[i] * other[i] for i in range (0, len(self)))
        else:
            return Assets(self[i] * other for i in range (0, len(self)))
    def __rmul__(self, other):
        return self.__mul__(other)

    def __imul__(self, other):
        raise NotImplemented

    def __truediv__(self, other):
        if isinstance(other, Assets):
            return Assets(self[i] / other[i] for i in range (0, len(self)))
        else:
            return Assets(self[i] / other for i in range (0, len(self)))
    def __floordiv__(self, other):
        raise NotImplemented
    def __divmod__(self, other):
        raise NotImplemented
    def __rdiv__(self, other):
        raise NotImplemented
    def __rdivmod__(self, other):
        raise NotImplemented

    def __add__(self, other):
        if isinstance(other, Assets):
            return Assets(self[i] + other[i] for i in range (0, len(self)))
        else:
            return Assets(self[i] + other for i in range (0, len(self)))
    def __sub__(self, other):
        if isinstance(other, Assets):
            return Assets(self[i] - other[i] for i in range (0, len(self)))
        else:
            return Assets(self[i] - other for i in range (0, len(self)))
    def __iadd__(self, other):
        return self.__add__(other)
    def __isub__(self, other):
        return self.__sub__(other)
    def __radd__(self, other):
        return self.__add__(other)
    def __rsub__(self, other):
        return self.__sub__(other)

    def __eq__(self, other):
        # should this just compare the sum?
        if isinstance(other, Assets):
            for i in range(0, len(self)):
                if other[i] != self[i]:
                    return False
            return True
        else:
            return other == sum(self)
    def __ne__(self, other):
        return not __eq__(other)

    def __ge__(self, other):
        if isinstance(other, Assets):
            return sum(self) >= sum(other)
        else:
            return sum(self) >= other
    def __gt__(self, other):
        if isinstance(other, Assets):
            return sum(self) > sum(other)
        else:
            return sum(self) > other
    def __le__(self, other):
        if isinstance(other, Assets):
            return sum(self) <= sum(other)
        else:
            return sum(self) <= other
    def __lt__(self, other):
        if isinstance(other, Assets):
            return sum(self) < sum(other)
        else:
            return sum(self) < other

    def __str__(self):
        return "Stock: {0} | Bond: {1}".format(self.assets[Assets.STOCK_INDEX], self.assets[Assets.BOND_INDEX])

    def divideIntoSinglePeriod(a, periods):
        seq = []
        for i in range(0, len(a)):
            seq.append(math.pow(a[i], 1.0/periods))
        return Assets(seq)

    def getMarketReturns(year):
        return Assets(
            marketData.getStockReturn(year),
            marketData.getBondReturn(year)
        )

    def getMarketReturns(year, month):
        return Assets(
            marketData.getSP500TotalReturn(year, month),
            marketData.getLongTermCorpBondsReturn(year, month)
        )