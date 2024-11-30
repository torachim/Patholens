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
