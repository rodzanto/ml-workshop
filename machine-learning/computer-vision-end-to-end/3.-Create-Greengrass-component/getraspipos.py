import json
import os
import sys
import config_utils




#new_config["track_name"] = config_utils.DEFAULT_TRACK_NAME
    
 


def damepos (m):
    track_path = os.path.join(config_utils.IMAGE_DIR, "track.json")
    f = open(track_path)
    data = json.load(f) 
    
    print("Published: '" , json.dumps(data[m]))
    return (data[m])
        
      # Closing file 
    f.close() 
