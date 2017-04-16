This document sets out to explain the technical aspects of this site/tool.

Everything else should be [self explanatory](dwr.azurewebsites.net)

## Stack
The code is hosted on **github**...which ought to be obvious if you are seeing this page.
Github is great.
It is ubiquitous in this space and deservedly so.

This site is hosted on **Azure**. 
Why? 
I have used azure professionally and love it. 
It has smooth integration with github, and a really intuitive interface.

**Flask** is the **Python** web framework being used.
Flask advertises itself as being easy, and correctly so.

The server side is written entirely in **Python 3.X**.
Python is super awesome. 
I'm writing it in Anaconda 3.5.1.
Azure is hosting it on 3.4.
Both seem to work.

The magic animation that makes this entire site interesting is made using **D3**.

Everything else on the front end is in **JQuery**, or sometimes plain old javascript/html/css.

Given an infinite time horizon, a monkey in a room with a typewriter will reproduce the works of William Shakespeare.
It would take that monkey maybe a week or two to reproduce the travesty that is the css of this site.

## Principals
Optimize for the user experience.
There is a ton of ugly jquery code that illustrates this :)

The latest HTML and CSS is fine.

If you have a choice, create things such that they depend on the fewest technologies in this list, in this order.  
1. Python  
2. Markdown  
3. Javascript  
4. JQuery  
5. D3  
6. Flask  
7. HTML  
8. Flask templating (jinja2)
9. Azure  

So, if you can implement something on the frontend in javascript or on the backend in python, choose python.

Minimize the size of requirements.txt.

Minimize the azure manual config (right now just integration with github) and web.config.

Optimize for strategies being easy to create.

When strategies are created, if possible verify their conclusions and sources.
test_Trinity.py is a great example of this in action.

## Source Layout
This isn't fully inclusive. It is just intended to give an overview.
root\\    
&nbsp;&nbsp;templates\\  
&nbsp;&nbsp;strategies\\ -*the various withdrawal strategy implementations are here*  
&nbsp;&nbsp;&nbsp;&nbsp;strategy_base.py -*the base class from which all strategies must inherit. A great place to start reading.*  
&nbsp;&nbsp;&nbsp;&nbsp;index.html -*the homepage*  
&nbsp;&nbsp;static\\  
&nbsp;&nbsp;&nbsp;&nbsp;content\\  -*button pngs and the like*  
&nbsp;&nbsp;&nbsp;&nbsp;scripts\\  -*the frontend javascript*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;displaySim.js -*D3 related javascript to display the simulation results*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;form.js -*JQuery front end form stuff*  
&nbsp;&nbsp;&nbsp;&nbsp;style\\  -*all the .css files you could ever want*  
&nbsp;&nbsp;data\\  -*various market data text files*  
&nbsp;&nbsp;web.config -*Azure needs this for hosting. It doesn't matter locally.*  
&nbsp;&nbsp;ptvs_virtualenv_proxy.py -*Azure needs this for hosting. It doesn't matter locally.*  
&nbsp;&nbsp;requirements.txt -*Azure needs this for installing requirements. It doesn't matter locally.*  
&nbsp;&nbsp;simulation.py -*the simulation engine*  
&nbsp;&nbsp;runserver.py -*run a local flask server*  
&nbsp;&nbsp;assets.py -*maybe the weirdest abstraction in the codebase, but a useful one. Lots of operator overloading to make it easy to multiply (for example) collections of stocks and bonds.*  
&nbsp;&nbsp;market_data.py -*the abstraction on top of the market data text files*  
&nbsp;&nbsp;main_dwr.py -*a convenient python entry point for debugging/profiling/etc. Not used otherwise.*  
  
## How do I start developing?
1. Install the latest version of python (3.X).
2. Install flask and markdown. 
"pip install Flask" and "pip install Markdown".
I usually just let pycharm do this for me.
3. Install...uh...a web browser.
4. Clone the source code.
5. from the source root, run "python runserver.py". This wil fire up a local flask server, the cmd line output will give you an address. Mine is http://localhost:5555/
6. Visit that address in a web browser.
7. At this point if you modify any of the code it should almost immediately show up on the site. Don't forget to force refresh the browser (ctrl+f5 for me).


### My Other Interesting Contribution
This is, to my knowledge, the only open source place that attempts to strictly replicate the trinity studies results, both their 1997 and 2010 results.

And...it turns out to be difficult. 
In the most simple case, where inflation is ignored and the portfolio is 100% bonds, I get different answers from them occasionally.

Its not obvious what the difference is. 
I waiver between optimism and pessimism compared to the trinity study, so I'm not off by something systematic. 
I went to the fucking public library and copied the exact bond indices they claim to use out of an overlarge book. 
And I know I copied those numbers correctly, because I copied month returns and year returns, and I use the year return as a checksum ("checkmultiplication?") on the monthly returns.

In general I am pessimistic by about 2% compared to any given trinity study success rate claim.

That said, I agree with them largely, and on all the important data points (success rates in the 90%'s) I agree almost completely. 
Still, it is curious...

If you look in test_trinity.py you can see more of this enumerated.