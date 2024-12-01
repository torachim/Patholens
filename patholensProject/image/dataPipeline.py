import os
from pathlib import Path

BASEDIR = Path(__file__).resolve().parent.parent
DATASETPATH = os.path.join(BASEDIR, "dataSets")


# go through all data Sets in the directory and return the names of the data Sets
def getDataSets():
    global BASEDIR, DATASETPATH

    allDataSets = []

    pathExists = os.path.exists(DATASETPATH)
    pathIsDirectory = os.path.isdir(DATASETPATH)

    if pathExists and pathIsDirectory:
        for dir in os.listdir(DATASETPATH):
            allDataSets.append(dir)

    return allDataSets


def addAllPatientsToDoctorsDB(docID):
    global DATASETPATH

    remainingPatients = {}

    allDataSets = getDataSets()

    for dataSet in allDataSets:
        # has all the paths to the availabe data sets
        allSubPaths = os.listdir(os.path.join(DATASETPATH, dataSet))

        allSubIDs = []
        for sub in allSubPaths:
            if "sub-" in sub:
                # splits the string at '-' and takes only the number of the string (our ID)
                subID = sub.split("-")[1]
                allSubIDs.append(subID)

        remainingPatients[dataSet] = {"url": allSubIDs}

    return remainingPatients


if "__main__" == __name__:
    addAllPatientsToDoctorsDB(2)
