#!/usr/bin/python
import redis
import sys
from hotqueue import HotQueue

q = ""

def printQueue():
	global q

	k = list()
	while(1) :
		x = q.get()
		if x is None : 
			break
		k.append(x)
	while len(k) != 0:
		x = k.pop(0)
		print "Element in Queue : ", x
		q.put(x)


def main(argv) :
	global q

	featureName = argv[1]
	featureStatus = argv[2]
	featureServer = argv[3]

	q = HotQueue(('server_'+featureName), host="localhost", port=6379, db=0)
	if featureStatus == "ON":
		q.put('http://127.0.0.1:'+featureServer)
	else :
		k = list()	
		while(1) :
			x = q.get()
			print "Queue get : ", x
			if x is None : 
				break;
			else :
				if x == ('http://127.0.0.1:'+featureServer) :
					print("Removing : ",x)
					break
				else:
					k.append(x)
		while len(k) != 0:
			x = k.pop(0)
			q.put(x)
	printQueue()
	
print(sys.argv)
main(sys.argv)
