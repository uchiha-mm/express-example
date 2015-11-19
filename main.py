#!/usr/bin/python
import redis
import sys
from hotqueue import HotQueue
import subprocess

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

def makeListOfQueue(queue):
	k = list()	
	while(1) :
		x = queue.get()
		if x is None : 
			break;
		else :
			k.append(x)
	for i in k:
		queue.put(i)
	return k

def main(argv) :
	global q

	#					
	# python main.py 	/a 		ON 		3000
	# python main.py 	/a 		OFF 		3000
	# python main.py 	/a 		RM 		featureFlag
	# python main.py 	3000 		RM 		server


	if len(sys.argv)==1 :
		q = HotQueue('servers', host="localhost", port=6379, db=0)
		while(1) :
			x = q.get()
			if x is None : 
				break;		
		output = subprocess.check_output("sudo docker ps", shell=True)
		result = {}
		port = {}
		for row in output.split('\n'):
		    if ':' in row:
		    	#key, value = row.split(':')
		        result = row.split(':')[1]
		        port = result.split('-')[0]
			q.put('http://127.0.0.1:'+port)	
		return
	
	
	featureName = argv[1]
	featureStatus = argv[2]
	featureServer = argv[3]

	q = HotQueue(('server_'+featureName), host="localhost", port=6379, db=0)
	featureNames = HotQueue('featureNames', host="localhost", port=6379, db=0)

	r_server = redis.Redis('localhost')
	if( not r_server.exists("initialRun")) :
		featureNames.put('servers')
		r_server.set("initialRun", "1")

	
	if featureStatus == "RM":
		if featureServer == "featureFlag":
			r_server.delete(featureName);
			while(1) :
				x = q.get()
				if x is None : 
					return;


		if featureServer == "server":
			listOfFeatures = makeListOfQueue(featureNames) 
			for i in listOfFeatures:	
				q = HotQueue((i), host="localhost", port=6379, db=0)
				k = list()	
				while(1) :
					x = q.get()
					if x is None : 
						break;
					else :
						if x == ('http://127.0.0.1:'+featureName) :
							if(r_server.get(i[7:]) > 0):
								r_server.decr(i[7:])
							break
						else:
							k.append(x)
				while len(k) != 0:
					x = k.pop(0)
					q.put(x)
			return;

	
	if featureStatus == "ON":
		q.put('http://127.0.0.1:'+featureServer)
		if(not r_server.exists(featureName)):
			r_server.set(featureName, '1');
			featureNames.put('server_'+featureName);
		else:
			r_server.incr(featureName)
		print 'set key value is: ' + r_server.get(featureName) 
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
					if(r_server.get(featureName) > 0):
						r_server.decr(featureName)
					print 'set key value is: ' + r_server.get(featureName) 
					break
				else:
					k.append(x)
		while len(k) != 0:
			x = k.pop(0)
			q.put(x)
	printQueue()
	print "Queue name : ",('server_'+featureName)
	
print(sys.argv)
main(sys.argv)