# Pulley Take Home Test - Michael Angerville

## Prerequisites:
* Please install node before running the app: https://nodejs.org/en/download

## To Run the App:
1. In the root directory, run the following:
   1. `npm i`
   2. `npm start`

## Answers to Questions:
1. How does your code work?
    - I store the request counts for each IP address in an array of maps. I ended up having to use an array of maps instead of just one map because it turns out that JS maps can only contain ~16M (2^24, but using 16M to be on the safe side) items. Therefore, in order to test this app with 20M+ request counts, I had to shard the request maps into separate maps with a max size of 16M. I keep track of the top 100 IP addresses with the most requests in a sorted array of tuples and update this top 100 as each request comes in. Keeping this array sorted allows me to insert and remove items to or from it quicker. I found an insert function on Stack Overflow that efficiently inserts new elements into a sorted array, essentially using binary search to find the index at which it needs to insert the new element. This is much faster than having to sort through all 20M+ entries and figure out the top 100 when the `top100` is called. Therefore, the `top100` function simply returns this value which is already kept up to date. This also keeps the `request_handled` function fast because it is only dealing with at most 100 sorted items as opposed to 20M+. The maps containing all the data for the request counts can be accessed and updated in O(1) time, except the sharding means we need to find the right map, but for 20M entries, that only means iterating over 2 maps. Instead of hard coding it to use 2 maps, I wanted to keep it extensible, so I use an array of maps that can keep growing as needed. However, I only tested up to 20M entries, so the app in its current state can run into other limitations that I may not be currently aware of. 
2. How would you test this to ensure it’s working correctly
    - I tested it by generating seed data for the request counts so that it would contain 20M IP addresses and a randomly generated number of requests each IP address made. Once all this data is set up in memory, I then call `request_handled()` once and measure the time it takes to run with this many entries in memory. I then call the `top100()` function, display the results in the console to make sure the array is properly sorted and time it with this many entries as well. Finally, I call the `clear()` function and ensure it can clear that many entries quickly.
3. What is the runtime complexity of each function?
    - The runtime complexity of `request_handled()` is O(M), linear. If N is the number of unique IP addresses, M = ceiling(N / 16000000).
    - The runtime complexity of `top100()` is O(1), constant.
    - The runtime complexity of `clear()` is O(1), constant.
4. What would you do differently if you had more time?
    - If I had more time, I would improve the tests by using a framework such as jest to write cleaner test code.
    - Also, I would probably set up the tests to actually use the `request_handled()` to seed the data instead of setting it using a randomly generated number of counts. This would be closer to how it would be used. I decided not to for now since this would mean iterating more than 20M times, so it might have taken too long for testing purposes. The ideal initial state of the data is 20M+ unique IP addresses associated with a number of requests, so I would have to generate a set of 20M random IP addresses, iterate let's say 200M to 1B times, selecting from the set of IP addresses I created, and then making the request with that IP.
5. What other approaches did you decide not to pursue?
    - I initially had the `request_handled()` function just update the request counts map instead of keeping a running tally of the top 100, and then going through all 20M+ entries to get the top 100 in the `top100()`. This made the `top100()` function run in about 22s, which did not meet the requirements.
    - I initially had stored the request counts in a `Record<string, number>` instead of a `Map<string, number>`. This led to slow insertions after ~8.3M, so I had to change it.
    - Once I switched to using `Map<string, number>`, I at first was using just one, until I hit the ~16M entry limit for a single map.
