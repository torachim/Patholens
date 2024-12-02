from accounts.models import Doctors
import uuid


def createUUIDs(amount):

    allUUIDs = []
    for i in range(amount):
        allUUIDs.append(str(uuid.uuid4()))

    return allUUIDs
