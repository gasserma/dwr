# dwr
The goal here is to explore the effect of diversifying withdrawal rate (dwr) strategies on retirement portfolios.

There is a lot of previous literature on withdrawal rate strategies...
[Trinity Study](http://afcpe.org/assets/pdf/vol1014.pdf)
[Trinity Study Update](https://www.onefpa.org/journal/Pages/Portfolio%20Success%20Rates%20Where%20to%20Draw%20the%20Line.aspx)
[Guyton Klinger](http://cornerstonewealthadvisors.com/wp-content/uploads/2014/09/08-06_WebsiteArticle.pdf)
[Wade Pfau's overview of existing literature](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2579123)
[cfiresim](http://cfiresim.com/)

None of this takes into account the idea of diversifying strategies, ie take your portfolio, divide it in half (or whatever) and use two strategies.

Diversification is hardly a novel idea in personal finance, but it seems to be in this niche of it. You ought to be able to minimize risks, smooth pro/cons, etc of the various strategies.

## My Other Interesting Contribution
This is, to my knowledge, the only open source place that attempts to strictly replicate the trinity studies results, both their 1997 and 2010 results.

And...it turns out to be difficult. In the most simple case, where inflation is ignored and the portfolio is 100% bonds, I get different answers from them occasionally.

Its not obvious what the difference is. I waiver between optimism and pessimism compared to the trinity study, so I'm not off by something systematic. I went to the fucking public library and copied the exact bond indices they claim to use out of an overlarge book. And I know I copied those numbers correctly, because I copied month returns and year returns, and I use the year return as a checksum ("checkmultiplication?") on the monthly returns.

In general I am pessimistic by about 2% compared to any given trinity study success rate claim.

That said, I agree with them largely, and on all the important data points (success rates in the 90%'s) I agree almost completely. Still, it is curious...

If you look in test_trinity.py you can see more of this enumerated.

## Overview of Software
This is all python code at this point, that runs on version 3.5.1. I'm using an anaconda windows installation.

The easiest way to understand what is happening in this code is probably to read a combination of test_strategies.py and simulation.py, particularly the runSimulation method.

### Main
There is nothing that interesting in main.py. Its just a good starting point to see if the code runs for you and I use it occasionally as an entry point for the profiler, etc.

### Data
There is a folder called data that contains plaintext files of various market returns. I need to clean all this up, it is by far the messiest part of the project. marketData.py is a bunch of hacky file reads to pull that data in.

### Strategies
The folder strategies contains implementations of withdrawal rate strategies. They all implement an abstract base class (such as that is in python). Tests for them live here too. The trinity study method is called constant_amount.py

### Engine
Everything else is the orchestration engine.

*simulation*
simulation.py contains two interesting things. 
1. The Simulation class which is chock full of results from a simulation run, including some pretty print (which isn't that pretty right now) and visualization work.
2. The runSimulation method which is the place where all simulations are run. 

*portfolio*
Very simply class that represents a portfolio as a value and an allocation.

*assets*
This is maybe the most confusing class here. It is just a list of floating point numbers. One number for each asset class we care about.

The point of this class is that it stops you from having to multiply/add/etc something.stocks and something.bonds all the time.

Context is important for this class, it might represent a portfolio and each float will be a huge number. It might represent an allocation and each float will be a small number that hopefully all sum to 1.0. It might represent market returns and hopefully each float is something slightly above 1.0.

## TODOS
1. Move this todo list somewhere better.
2. Implement Guyton Klinger
3. Find more different and absurd ways to compare floating point numbers. You'll note I do something different every time because everyone needs an outlet for their anger.
4. Play around with visualizations. This is going to end up being the compelling way of looking at this stuff I think.
5. Clean up the market data.
6. Get more market data sources for fun.


