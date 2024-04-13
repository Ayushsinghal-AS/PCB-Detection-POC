import os
import glob

crop = glob.glob("cropped/*")
jsn = glob.glob("json/*")
jsn_list= glob.glob("jsonList/*")


for i in range(len(crop)):
    os.remove(crop[i])
    if i== 0:
        os.remove(jsn[i])
    os.remove(jsn_list[i])
