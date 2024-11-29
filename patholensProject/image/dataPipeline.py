import os


# go through all data Sets in the directory and return the names of the data Sets
def getDataSets():

    allDataSets = []

    pathExists = os.path.exists("dataSets")
    pathIsDirectory = os.path.isdir("dataSets")

    if pathExists and pathIsDirectory:
        for dir in os.listdir("dataSets"):
            allDataSets.append(dir)

    print(allDataSets)
    return allDataSets


if __name__ == "__main__":
    getDataSets()
