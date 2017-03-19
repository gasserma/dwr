class Portfolio:
    def __init__(self, allocation, value=1.0):
        if abs(sum(allocation) - 1.0) > .000009:
            raise RuntimeError("Allocations need to add up to 1.0")
        self.allocation = allocation
        self.value = value

    def copy(self):
        return Portfolio(self.allocation, self.value)

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