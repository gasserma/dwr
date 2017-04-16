# F.A.Q.

Well...right now every question has been asked with a frequency of 0.
So instead, these are questions I imagine people will ask.

## Stocks and Bonds can mean many different things. What do you mean?
Right now stocks means SP 500 data. 
Bonds means Ibbotson's Long Term Corporate Bonds.
This is what the famous Trinity study used, so it is what I used.

## Inflation. What's the story?
Don't ever think about inflation when you look at results here.
The visualizations and simulations intend to completely abstract that away from you.
When you see a withdrawal of $40k in year 2 and withdrawal of $40k in year 27 they are both $40k in purchasing power.
They are actually quite different in "nominal" dollar amount though.
But there is no reason to think in anything other than "real" dollars.
The portfolio values, are the same way.
When the graph tells you your portfolio has the same value 20 years apart, what it means is that you can buy the same number of hamburgers.

## Wait, the inflation calculations seem a little off though.
What is actually happening is that inflation is applied one year late.
(Using the January CPI for Urban Consumers from the previous year)
This again is a trinity study convention.
Their idea seems to have been that you would wait a year to actually see what inflation was before adjusting your withdrawal.

## Why do you auto-populate stocks and bonds with 50% each?
I've agonized over this a lot. 
I hate the idea of suggesting an allocation.
You should pick an allocation yourself.
In the end, making the UI easy to use was more important to me than avoiding any subtle prescriptive advice.
50/50 was chosen because it seemed the least likely to imply that I am suggesting a specific allocation.

## Same story with all the other auto-population?
Yes.
I've tried to stay true to the sources for the various strategies in the context of how people have taken them.
For example, the Constant Amount withdrawal strategy populates with a 4% initial withdrawal, which seems to be the main takeaway from the Trinity study.
I don't mean to suggest that any of the pre-populated values are the right ones.

## My retirement length was set to 30 years. Why do I see 31 dots?
This is a trinity study convention. 
X periods is X portfolio growths and X + 1 portfolio withdrawals.
This imbues pessimism into the system, which is good.

## I'm running IE6 and your site doesn't work.
People running old versions of Internet Explorer have no hope of ever retiring so it is okay that the site doesn't work.
Just assume 0% success rate on everything.

## How do I start developing code against this?
Great question. See the [github readme](https://github.com/gasserma/dwr/blob/master/README.md).