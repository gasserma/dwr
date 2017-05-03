from helpers import isclose
from assets import Assets


class Portfolio:
    def __init__(self, allocation, value=1.0):
        if type(allocation) is LinearRamp:
            if not isclose(sum(allocation.start), 1.0):
                raise RuntimeError("Allocations need to add up to 1.0")
            if not isclose(sum(allocation.end), 1.0):
                raise RuntimeError("Allocations need to add up to 1.0")
            self.allocation = allocation.start
            self.ramp = allocation
        else:
            if not isclose(sum(allocation), 1.0):
                raise RuntimeError("Allocations need to add up to 1.0")
            self.allocation = allocation
            self.ramp = None
        self.value = value

    def copy(self):        
        return Portfolio(self.ramp.copy() if self.ramp else self.allocation, self.value)

    def withdraw(self, amt):
        if amt < self.value:
            self.value -= amt
            return amt
        else:
            ret = self.value
            self.value = 0.0
            return ret

    def grow(self, growBy):
        self.value = sum(self.value * self.allocation * growBy)
        if self.ramp:
            self.allocation = self.ramp.__next__()
        

# actually, a geometric and exponential ramp sounds super interesting.

class LinearRamp():
    def __init__(self, start, end, expectedIterations):
        self.start = start
        self.end = end
        self.expectedIterations = expectedIterations
        self.count = 0

    def copy(self):
        return LinearRamp(self.start, self.end, self.expectedIterations)

    def __iter__(self):
        return self
    
    def __next__(self):
        newAssets = self.interpolate()
        if not isclose(sum(newAssets), 1.0):
            raise RuntimeError("Allocations need to add up to 1.0")
        self.count += 1
        if self.count > self.expectedIterations:
            raise StopIteration
        return newAssets
    
    def interpolate(self):
        """ This is confusing enough just needing to know algebra...
        You also need to realize that start, end, and the return value are all Assets classes
        that represent collections of stocks, bonds, etc. Good luck.
        """
        m = (-1.0 * (self.start - self.end))
        b = self.start
        x = self.count / (self.expectedIterations - 1)
        return m * x + b
        