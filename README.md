# arborium

https://arborium-forum.web.app

Source code for the client and server server side

To initialize, start with a Routify.dev template

Authentication is firebase, DB is Firestore, Google cloud functions

It is propabely very poorly coded (I've been into this for only 3 month) so sort out what you want to keep and throw away

It has been thought to handle a lot of votes on the messages(each node in the tree).
When loading a tree, we are not fetching a list of individual messages, were are fetching a document representing the tree itself, or a skimmed version of the tree, to reduce the number of reads to the DB.

The format of a tree document is basically a compressed version of a JSON file of a list of javascript object, each of these objects containing
 - the title of a given message (and not the content)
 - the ID of its parent message in the tree
 
Every time someone votes on a message, there are several things that have to be done:
 - the user's document in the DB needs to be updated with the new vote
 - the message itself needs to have its vote counter updated
 - the tree document must received the new message if the vote corresponds to a new message
 - the skimmed tree document must receive the same input, and be recomputed in case the new vote triggers that message (and possibly the whole subsequent branch) to be removed from the skimmed tree

My solution considering the firestore limitation of 1 write/second per single document was to use a sub-collection called "votesTemp" on each user document.
Being a subcollection as firestore defines it, it means in one query we can access all the new votes that are scattered among all the user documents.
These "votesTemp" documents will be used to update the user's vote on a specific message and update the vote counters on the designated message, which wil trigger a recomputing of the tree and skimmed tree.

This is a heavy process requiring cloud functions. In order not to trigger that process every time a user compulsively changes his vote on a message, or in case there are 100 people voting on a message at the same time, we let the new votes accumulate in that "voteTemp" subcollection, and we run a scheduled function every 2 minutes that: 
 - collects the whole subcollection, 
 - filters out the irrelevant votes in case of one user switching his vote 10 times in the last two minutes, 
 - updates each user's new vote on each user document,
 - sums up, per single message, among the recently filtered new votes subcollection, the increments to be applied to its votes counters
 - recomputes the trees after all the mesage documents have been updated

the files for the cloud functions that handle this process are the 3 typescript files in the "server" folder


security rules are probably flawed, check before using

Once again this is probabely poor work, first time attempt at coding a website, and might never grow more than just an example for real developers to pursue the idea.. So fork at will, make it decent, make money, whatever..


Questions welcome to arborium.forum@gmail.com
