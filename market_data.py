import os

cpi = {
    1924: 17.3,
    1925: 17.3,
    1926: 17.9,
    1927: 17.5,
    1928: 17.3,
    1929: 17.1,
    1930: 17.1,
    1931: 15.9,
    1932: 14.3,
    1933: 12.9,
    1934: 13.2,
    1935: 13.6,
    1936: 13.8,
    1937: 14.1,
    1938: 14.2,
    1939: 14,
    1940: 13.9,
    1941: 14.1,
    1942: 15.7,
    1943: 16.9,
    1944: 17.4,
    1945: 17.8,
    1946: 18.2,
    1947: 21.5,
    1948: 23.7,
    1949: 24,
    1950: 23.5,
    1951: 25.4,
    1952: 26.5,
    1953: 26.6,
    1954: 26.9,
    1955: 26.7,
    1956: 26.8,
    1957: 27.6,
    1958: 28.6,
    1959: 29,
    1960: 29.3,
    1961: 29.8,
    1962: 30,
    1963: 30.4,
    1964: 30.9,
    1965: 31.2,
    1966: 31.8,
    1967: 32.9,
    1968: 34.1,
    1969: 35.6,
    1970: 37.8,
    1971: 39.8,
    1972: 41.1,
    1973: 42.6,
    1974: 46.6,
    1975: 52.1,
    1976: 55.6,
    1977: 58.5,
    1978: 62.5,
    1979: 68.3,
    1980: 77.8,
    1981: 87,
    1982: 94.3,
    1983: 97.8,
    1984: 101.9,
    1985: 105.5,
    1986: 109.6,
    1987: 111.2,
    1988: 115.7,
    1989: 121.1,
    1990: 127.4,
    1991: 134.6,
    1992: 138.1,
    1993: 142.6,
    1994: 146.2,
    1995: 150.3,
    1996: 154.4,
    1997: 159.1,
    1998: 161.6,
    1999: 164.3,
    2000: 168.8,
    2001: 175.1,
    2002: 177.1,
    2003: 181.7,
    2004: 185.2,
    2005: 190.7,
    2006: 198.3,
    2007: 202.416,
    2008: 211.08,
    2009: 211.143,
    2010: 216.687,
    2011: 220.223
}

# Keeping all the keys of this dict as strings because that way we can steal the data effortlessly from cFIREsim
# We will optimize all this later...it probably needs it if we ever do monte carlo on top of this.
def getCPI(year):
    if int(year) > 2014 or int(year) < 1871:
        raise IndexError
    return cpi[int(year)]

def getInflation(baseYear, currentYear):
    if int(currentYear) == 1871:
        return 1.0
    # turns out these CPI numbers are january numbers for the given year, so we subtract 1
    # because thats really like december of the previous year.
    startCpi = getCPI(baseYear - 1)
    endCpi = getCPI(currentYear - 1)
    return 1.0 + ((endCpi - startCpi) / startCpi)

def getSP500TotalReturn(year, month):
    div = getSP500Dividends(year, month)
    rate = getSP500Return(year, month)
    return div + rate - 1.0

def mapMonthStringToInt(month):
    if "jan" in month.lower():
        return 1
    elif "feb" in month.lower():
        return 2
    elif "mar" in month.lower():
        return 3
    elif "apr" in month.lower():
        return 4
    elif "may" in month.lower():
        return 5
    elif "jun" in month.lower():
        return 6
    elif "jul" in month.lower():
        return 7
    elif "aug" in month.lower():
        return 8
    elif "sep" in month.lower():
        return 9
    elif "oct" in month.lower():
        return 10
    elif "nov" in month.lower():
        return 11
    elif "dec" in month.lower():
        return 12
    else:
        raise ImportError

# going to map tuples of (year, month) to a float that is the percent increase
sp500DividendsCache = {}

def getSP500Dividends(lyear, lmonth):
    if (lyear, lmonth) not in sp500DividendsCache:
        script = os.path.dirname(__file__)
        path = os.path.join(script, "./data/sp500dividends.txt")
        f = open(path, mode="r")
        for line in f:
            split = line.split()
            month = mapMonthStringToInt(split[0])
            year = int(split[2])
            val = float(split[3].replace("%", "")) / 100.00
            sp500DividendsCache[(year, month)] = val

    return (sp500DividendsCache[(lyear, lmonth)] / 12) + 1.0


# going to map tuples of (year, month) to a float that is the percent increase
sp500ReturnsCache = {}

def getSP500Return(lyear, lmonth):
    if (lyear, lmonth) not in sp500ReturnsCache:
        value = {}
        script = os.path.dirname(__file__)
        path = os.path.join(script, "./data/sp500.txt")
        f = open(path, mode="r")
        for line in f:
            split = line.split()
            month = mapMonthStringToInt(split[0])
            year = int(split[2])
            val = float(split[3].replace(",", ""))

            # except this file tracs to the 1st of the month...
            month -= 1
            if month == 0:
                year -= 1
                month = 12

            value[(year, month)] = val

        for yearMonth in value.keys():
            pyear = yearMonth[0]
            pmonth = yearMonth[1] - 1
            if pmonth == 0:
                pyear = pyear -1
                pmonth = 12

            if (pyear, pmonth) in value:
                cur = value[yearMonth]
                prev = value[(pyear, pmonth)]
                rate = cur / prev
                sp500ReturnsCache[yearMonth] = rate
            else:
                sp500ReturnsCache[yearMonth] = 1.0

    return sp500ReturnsCache[(lyear, lmonth)]




longTermCorpBondsReturnCacne = {}

def getLongTermCorpBondsReturn(lyear, lmonth):
    if (lyear, lmonth) not in longTermCorpBondsReturnCacne:
        script = os.path.dirname(__file__)
        path = os.path.join(script, "./data/longtermcorpbonds.txt")
        f = open(path, mode="r")
        for line in f:
            if "YEAR" in line:
                continue
            split = line.split()
            year = int(split[0])
            yearRate = float(split[13]) / 10000
            yearRateCalc = 1.0
            for i in range(1, 13):
                monthRate = float(split[i]) / 10000
                yearRateCalc = yearRateCalc * (1.0 + monthRate)
                longTermCorpBondsReturnCacne[(year, i)] = monthRate

            if abs(yearRateCalc - yearRate + 1.0) < .00005:
                raise ReferenceError # what exception should I use?

    return longTermCorpBondsReturnCacne[(lyear, lmonth)] + 1.0