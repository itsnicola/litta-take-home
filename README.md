## TO RUN: 
docker compose up --build

For development I used docker compose up --build --watch

Under the hood, the API is a Node.js Express app, using npm. The frontend is Vue, also using npm, and for the DB I went with PostgreSQL.

## UNFINISHED:

Within the 3-4 hours, I wasn't able to get as much done as I would've liked. I concentrated on the user-facing page, and didn't get to the internal assignment platform at all. 

Perhaps I was slowed down as I am not overly familiar with Vue - I generally lean towards the backend and my experience is with Angular which I was less keen to apply. Much of the frontend I generated with Codex. I maybe spent too much time considering the overall look of the UI, and would've been better off spending this on functionality, however I thought it was important that the customer have a good experience, particular on the quote page. 

For this reason, there is definitely a lack of input validation and I cut corners by not implementing tests.

## PRODUCT JUDGEMENT WRITEUP: 

# What you'd build next, and why. With another two days, what's highest-value? What would you push back on if a PM asked for it?

Naturally, I would want to implement the internal system as I didn't touch that so far. 

Within what I did build, I think the most critical would be the lack of validation. Here, I'd want to add a postcode checker. Currently, any value at all in the postcode input will pass. One option to fix this would be to bring in an npm package of valid postcodes and ensure that the input is valid via that. The other option would be to maintain a list of postcodes in the database, and check against those. This adds a bit more overhead, though, so I only lean this way if there were other values being stored with the postcodes - for example, if the postcode surcharge was to be stored, this might validate adding a postcode table to the DB. 
I would support this frontend validation with something in the backend - in the API before sending requests I would check these postcodes again, just to ensure the data is coming in as we expect from the frontend. 
The same would be true of the emails, which currently also permits any value. 


# One trade-off you made and how you'd revisit it at scale. What would change at 100 bookings/day vs 10,000?

The biggests trade-off in what I was able to achieve was the way of looking up quotes. At the moment, there is a listener that sends off a DB call whenever a change is made to the input fields on the frontend. While this works, it's a bit intensive for a very public page and doesn't currently have any protections. I would be inclined to add a rate limiter, so there is a slight cool down between quotes that can be requested. 


## ASSUMPTIONS: 

I assuemd that the customer-facing portal was more important and high-value than the internal one. 

I also assumed that the booking reference could be any value, so long as it was unique for the request. 
