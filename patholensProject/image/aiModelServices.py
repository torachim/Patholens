from image.dataHandler import getAIModelNamesFromMediaFolder
from .models import AiModel, Media

def syncAIEntries(dataset: str) -> bool:
    """
    Retrieves all the possible ai model names of a dataset and adds them to the database.

    Args:
        dataset (str): The name of the dataset

    Returns:
        bool: True when everythin works
    """
    
    aiModels: list[str.upper] = getAIModelNamesFromMediaFolder(dataset)
    
    for model in aiModels:
        # Skip, if the objects exists
        if AiModel.objects.filter(modelName=model).exists():
            continue
        # Skip, if the Media entry is not existing any more
        if not Media.objects.filter(name=dataset).exists():
            continue
        
        # Create a new ai model entry
        media: Media = Media.objects.get(name=dataset) 
        AiModel.objects.create(modelName=model, mediaEntry=media, visibility=True)
    
    return True
