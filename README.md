# arborium

Source code for the client and server server side

To initialize, start with a Routify.dev template

Authentication is firebase, DB is Firestore, Google cloud functions

It is propabely very poorly coded (I've been into this for only 3 month) so sort out what you want to keep and throw away

It has been thought to handle a lot of votes, and my solution considering the firestore limitation of 1 write/second per single document was to use a sub-collection called "votesTemp" on each user's document, before writing it after processing to the user's document itself.

the files for that are the 3 typescript files in the "server" folder

Every once in a while, a scheduled cloud functions gathers all the "votesTemp" from all users, 
delete the ones that are out of date in case a single user switched his vote several times since the last processing, 
checks if that last vote is relevant compared to the one (if any) on the user's document,
updates each users document with le last relevant votes
calculates which messages counters to increment (or decrement if the vote is a change and not a new)
updates the messages documents
updates the trees, which are single documents, containing only the titles of the messages and the relevant counters to diplay in the browser

trees are compressed to be as light as possible (functions in the files explicitely)

security rules are probably flawed

Once again this is probabely poor work, first time attempt at coding a website, and might never grow more than just an example for real developers to pursue the idea.. So fork at will, make it decent, make money, whatever..

and no need to hack the github account...


Questions welcome to arborium.forum@gmail.com
