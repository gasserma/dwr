'''
This is the meat of this entire project.
'''
from statistics import stdev

class Simulation:
    def __init__(self, minYear, maxYear, length, ignoreInflation, initialPortfolio, failureThreshold):
        self.minYear = minYear
        self.maxYear = maxYear
        self.length = length
        self.ignoreInflation = ignoreInflation
        self.initialPortfolio = initialPortfolio
        self.failureThreshold = failureThreshold
        self.iterations = 0
        self.failures = []
        self.underflow = []
        self.overflow = []
        self.endPortfolioValue = []
        self.endRelativeInflation = []

        # this is a list of lists, where the top level list is per simulation and the second
        # dimension list is a tuple of (year, month, withdrawal, portfolioValue). Year and
        # month aren't strictly necessary (can be inferred from other data),but make it easier to debug.
        self.recordedData = []

    def getSimResults(self):
        results = []
        for i in range(0, self.iterations):
            ps = []
            ws = []

            p = None
            for y in range(0, self.length + 1):
                wAccumulator = 0
                for m in range(0,12):
                    if len(self.recordedData[i]) > m+(y*12):
                        wAccumulator += self.recordedData[i][m+(y*12)][2]
                        p = self.recordedData[i][m+(y*12)][3]
                    else:
                        wAccumulator += 0
                ps.append(p)
                ws.append(wAccumulator)

            results.append({"portfolio_values" : ps, "withdrawals" : ws})
        return results

    def getStats(self):
        stats = {
            "portfolio_ended_up_larger": self.getPortfolioGrewRate(),
            "success_rate": self.getSuccessRate()
        }
        return stats

    def getDistStats(self):
        stats = [
            gatherWebResponseData(self.underflow, "underflow", "The sum of (actual withdrawal - initial withdrawal) "
                                                               "for all withdrawals where the withdrawal was less than "
                                                               "the initial withdrawal. This is a measure of missing "
                                                               "purchasing power. 0 is the best possible result here."),
            gatherWebResponseData(self.overflow, "overflow", "The sum of all the withdrawals  where the withdrawal was "
                                                             "above the initial withdrawal amount. This is a measure of "
                                                             "extra purchasing power. The higher, the better."),
            gatherWebResponseData(self.endPortfolioValue, "end_portfolio_value", None)
        ]
        return stats

    def getYearlyStats(self):
        epv = []
        for i in range(0, self.iterations):
            epv.append(self.recordedData[i][-1][3])

        pg = []
        for i in range(0, self.iterations):
            pg.append(self.recordedData[i][-1][3] > self.initialPortfolio)

        stats = {
            "ending_portfolio_value": epv,
            "portfolio_ended_up_larger": pg
        }

        return stats

    def getPortfolioGrewRate(self):
        total = 0
        grew = 0
        for i in range(0, self.iterations):
            total += 1
            if self.recordedData[i][-1][3] > self.initialPortfolio:
                grew +=1
                
        return grew / total

    def recordData(self, simIteration, year, month, withdrawal, portfolioValue):
        if len(self.recordedData) < simIteration + 1:
            self.recordedData.append([])
        self.recordedData[simIteration].append((year, month, withdrawal, portfolioValue))

    def recordSuccess(self):
        self.iterations += 1

    def recordFailure(self, startYear, endYear):
        self.iterations += 1
        self.failures.append((startYear, endYear))

    def getSuccessRate(self):
        return 1 - (len(self.failures) / self.iterations)

    def finalize(self):
        if self.iterations != len(self.underflow):
            raise RuntimeError
        if self.iterations != len(self.overflow):
            raise RuntimeError
        if self.iterations != len(self.endPortfolioValue):
            raise RuntimeError
        if self.iterations != len(self.endRelativeInflation):
            raise RuntimeError

    def __str__(self):
        output = []
        output.append("Simulation run over all {0} year periods from {1} to {2}"
                      .format(self.length, self.minYear, self.maxYear))
        if self.ignoreInflation:
            output.append("You have opted to ignore inflation (why?!) so all numbers given are not inflation adjusted")
        else:
            output.append("All numbers are inflation adjusted")

        output.append("Success Rate: {0:.2f} Initial Portfolio: {1} Failure Threshold: {2}"
                      .format(self.getSuccessRate(), self.initialPortfolio, self.failureThreshold))

        output.append("")
        output.append("Measure   \tMean\tMin\t5%tile\t50%tile\t95%tile\tMax")
        output.append('\t'.join(gatherData("Legacy    ", self.endPortfolioValue)))
        output.append('\t'.join(gatherData("UnderFlow ", self.underflow)))
        output.append('\t'.join(gatherData("OverFlow  ", self.overflow)))

        return '\n'.join(output)

def gatherData(name, iter):
    return (name,
            "{0:.2f}".format(getMean(iter)),
            "{0:.2f}".format(min(iter)),
            "{0:.2f}".format(getPercentile(iter, .05)),
            "{0:.2f}".format(getPercentile(iter, .50)),
            "{0:.2f}".format(getPercentile(iter, .95)),
            "{0:.2f}".format(max(iter)))

def getMean(iter):
    return sum(iter) / len(iter)

def getPercentile(iter, percentile):
    sort = sorted(iter)
    length = len(iter) - 1
    index = int(round(percentile * length))
    return sort[index]


def gatherWebResponseData(iter, name, tooltip):
    return {
        "name": name,
        "tooltip" : tooltip,
        "mean": getMean(iter),
        "min": min(iter),
        "max": max(iter),
        "fifth_percentile": getPercentile(iter, .05),
        "nintey_fifth_percentile": getPercentile(iter, .95),
        "std_dev": stdev(iter)
    }