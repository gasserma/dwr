# The Basics

### How much do I need to retire?  

No one knows.
WWIII might start tomorrow, you might win the lottery, you might acquire an expensive disease, you might acquire a lucrative disease, or you might find you spend a lot less, or more, in retirement.  

But for most people, retirement follows a pretty straightforward path, without a lot of surprising financial obstacles.
This means you *can* plan for it.

The best way to do that is to ask yourself:  
 
**1.** How much do I have saved for retirement?  
**2.** How much do I want per year in retirement?  
**3.** How long do I think my retirement will be?

Once you have those answers, this site can tell you what your chances are.
Nothing is magic.
If you want $80,000 per year for 30 years and have only $1,000,000 saved, you aren't going to get encouraging results.
But you will get results; they will say something like "5% chance of success." 
So, that isn't great. 
What should you do?
Save more, want less, or be more pessimistic about your lifespan (which might actually work - negative thoughts can have an effect on longevity).
The first two are the more reasonable options, though.
This site is for you to play around and figure out what those numbers are.

### How does the PDP know what will happen?

I don't. 
No one does. 
Incidentally, there are currently very few known lucrative diseases.  

This site looks at what has happened using historical financial data (from the SP500, and Ibbotson's Long Term Corporate Bond Index).
The past is often our best indication of what will happen. 
Specifically, this site will take every year from 1926 to the present, and show you what would have happened if you retired then.
You can see how you would have fared during the Great Depression, WWII, and a lot of normal times, too.

This site isn't claiming to know the future, just the past.
But so far, things have been pretty predictable. 

### What's the accepted answer?

A lot of people quote the 4% rule.
It says you can withdraw four percent of your initial nest egg, pretty much indefinitely.
It is based on something called the Trinity Study.
You can see what that looks like on this site.
Here on PDP, we are calling this the *Constant Amount* strategy.

Lets pick a typical 30 year retirement with a $1,000,000 nest egg.
4% of that is $40,000 per year.

Here, you see a graph that changes about 50 times. 
Each time it changes, it represents what would have happened if you retired starting at the year in the big label.
Each polka dot you see represents a withdrawal from your nest egg.
The Y-axis of the graph shows your nest egg size.
The X-axis shows the withdrawals over the length of your retirement.

Watch the animation.
Try clicking the forward, backward, play/pause, and reset buttons.
Put your mouse over the year label to zoom around.

<label type="submit" class="trinityGraphButt">Show Graph</label>
<p id="trinityGraph" style="display: none;"></p>

### Wait, why bother looking further than the 4% rule?

The 4% rule has weaknesses.
Other ideas have strengths.
This is important; spending 10 minutes to feel more confident about your retirement isn't a lot.
  
### Okay, so what do I do instead?

I don't know.
But this site will let you explore strategies and figure it out.

Let's take a look.
Next, we will try a strategy that is called the *Constant Percent* strategy; in it, we take out 4% of our portfolio every year.
This is different than the *Constant Amount* 4% rule strategy.
In the *Constant Amount* strategy, we took out $40,000 every year, which was 4% of the starting nest egg.

Notice that there are some new things showing up.
The dots are changing sizes.
Dot size correlates with withdrawal amount.
Some of the dots are red.
Dots turn red when the withdrawal is less than the initial amount.
Big blue dots are awesome, small red dots are bad.

<label type="submit" class="percentGraphButt">Show Graph</label>
<p id="percentGraph" style="display: none;"></p>

### Cool, which was better?

Well, probably the *Constant Amount*.
But it's hard to say.
The *Constant Amount* strategy is more predictable.
But, the *Constant Percent* strategy had some years where you were withdrawing twice what the *Constant Amount* strategy gave you. 

Let's compare them side by side.
This time, the *Constant Amount* is going to be in blue dots.
The *Constant Percent* will be in green and yellow.
Green for more than the initial withdrawal, yellow for less.

<label type="submit" class="compareGraphButt">Show Graph</label>
<p id="compareGraph" style="display: none;"></p>

### Anything else I should know?

Sure...but some of this is pretty advanced, so don't worry if it doesn't make sense immediately.
Let's talk about two last things:  
The various strategies you can visualize with this tool, and the concept of diversifying your use of the strategies.

### The Strategies

#### *Constant Amount*

This is a very simple strategy.
Pick an amount and withdraw that amount every year.
The Trinity Study explores this strategy in depth.  
<a href="http://afcpe.org/assets/pdf/vol1014.pdf" target="_blank">Trinity Study</a>
<a href="https://www.onefpa.org/journal/Pages/Portfolio%20Success%20Rates%20Where%20to%20Draw%20the%20Line.aspx" target="_blank">Trinity Study Update</a>

#### *Constant Percent*

Another simple strategy.
Withdraw a percentage of your portfolio every year.
This isn't a great whole portfolio strategy, but can be useful in combination with other strategies.
It also happens to be the most useful strategy for wrapping your mind around the visualization this site provides.

#### *Guyton Klinger*

This strategy rarely fails, but frequently underperforms the initial withdrawal.
It is based on following some simple rules (and some not so simple ones as well) that cause increases and decreases in withdrawals based on market performance, as well as maintaining cash reserves for bad years.  
<a href="http://cornerstonewealthadvisors.com/wp-content/uploads/2014/09/08-06_WebsiteArticle.pdf" target="_blank">Guyton Klinger</a>

#### *Hebeler Autopilot*

This strategy is based on your life expectancy.
Each year you get closer to dying, you withdrawal a greater percentage.
You trade constantly being confronted with your mortality for a solid strategy :).    
<a href="http://www.marketwatch.com/story/put-retirement-savings-withdrawals-on-autopilot-2013-07-24" target="_blank">Hebeler's Autopilot</a>

#### *VPW*

This strategy is based on annuity payment calculations.
You provide an expected return of your portfolio and the "payments" from your nest egg are calculated based on that.  
<a href="https://www.bogleheads.org/forum/viewtopic.php?t=120430" target="_blank">The VPW Post</a>

### Diversifying Among Strategies

In most financial decisions, when you are presented with two appealing options, you should try to do both.
This is why most people have stocks and bonds in their portfolios.
This is why some people contribute to Roth and Traditional IRAs.
There is no reason to not treat portfolio withdrawal strategies the same way.

You will notice that when you add a strategy, a "weight" appears.
If you have one strategy, it will have a weight of 100%. 
If you add another strategy, the weights will split to 50% each, and some of the default parameters of the strategies might change.
When you run the simulation, your portfolio is split into as many buckets as you have strategies, according to the weights.
The simulation then executes that strategy against that bucket's worth of money.
The final polka dot size you see is the sum of all the withdrawals from all the strategies.

This is useful if you like the idea of having a conservative strategy for your "bare minimum" survival amount, and an agressive strategy for everything else.
It's useful whenever you wish you could combine properties of the various strategies.


### Okay, what next?

Play around [here](.\home).  
Check the [FAQ](.\faq) for some more detailed information.  
If you want to give feedback, find contact info in the [about section](.\about), or file bugs directly in the [source](.\source).
