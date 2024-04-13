import cv2
import numpy as np
import glob

import os
import json


def compute_iou( 
    boxA, boxB
):
    xA = max(boxA["TOP_LEFT_X"], boxB["TOP_LEFT_X"])
    yA = max(boxA["TOP_LEFT_Y"], boxB["TOP_LEFT_Y"])
    xB = min(boxA["BOTTOM_RIGHT_X"], boxB["BOTTOM_RIGHT_X"])
    yB = min(boxA["BOTTOM_RIGHT_Y"], boxB["BOTTOM_RIGHT_Y"])
    interArea = max(0, xB - xA + 1) * max(0, yB - yA + 1)
    boxAArea = (boxA["BOTTOM_RIGHT_X"] - boxA["TOP_LEFT_X"] + 1)*(boxA["BOTTOM_RIGHT_Y"] - boxA["TOP_LEFT_Y"] + 1)
    boxBArea = (boxB["BOTTOM_RIGHT_X"] - boxB["TOP_LEFT_X"] + 1)*(boxB["BOTTOM_RIGHT_Y"] - boxB["TOP_LEFT_Y"] + 1)
    iou = interArea / float(boxAArea + boxBArea - interArea)
  
    return iou
def non_max_suppression(
    objects,
    non_max_suppression_threshold=0.9,
    score_key="MATCH_VALUE",
):
    sorted_objects = sorted(objects, key=lambda obj: obj[score_key], reverse=True)
    filtered_objects = []
    for object_ in sorted_objects:
        overlap_found = False
        for filtered_object in filtered_objects:
            iou = compute_iou(object_, filtered_object)
            if iou > non_max_suppression_threshold:
                overlap_found = True
                break
        if not overlap_found:
            filtered_objects.append(object_)
    return filtered_objects

        


#################################################### detections on Test images########################################################

json_lst = glob.glob('jsonList' +'/*')

train_detections = []
for i in json_lst:
    #print(i)

    with open(i) as f:
        #for json_obj in f:
        coordiantes = json.load(f)
    #print(coordiantes)

    for j in coordiantes:
        train_detections.append(j)
            #employee_list['employee_records'].append(employee_dict)

with open('final.json','w') as f:
    json.dump(train_detections,f,indent=4)

    

def template_matching(test_imgpath,template_path):
    f = open('final.json')
    location  = json.load(f)
    #print("data",location)
   



######################################################## template list and locations #################################################################################    
    coordinate_list  = {}
    for i in range(len(location)):
        top_left_y, bottom_right_y,top_left_x,bottom_right_x = location[i]['TOP_LEFT_Y'],location[i]['BOTTOM_RIGHT_Y'],location[i]['TOP_LEFT_X'],location[i]['BOTTOM_RIGHT_X']
        coordinate_list[location[i]['LABEL']] =   [top_left_y, bottom_right_y,top_left_x,bottom_right_x]
    #print(coordinate_list)

    new_list = sorted([(k , v) for k, v in coordinate_list.items()])

    min_pix =  999999
    for i in new_list:
        temp=min(i[1])
        if min_pix>temp:
            min_pix=temp
    #print(min_pix)
   
        # reading templates

    # read templates from the template folder
    lst =  glob.glob(template_path+'/*.jpeg')
    lst = sorted(lst)
    #print("aa",sorted(lst))

    template_list = []
    for i in lst:
        template_list.append(cv2.imread(i))
        #print(cv2.imread(i))
        
    # for i in template_list:
    #     cv2.imshow("",i)
    #     cv2.waitKey(0)
    
    threshold = 0.7
    #RGB_img = cv2.imread("template_datasets/T1.JPEG")
    RGB_img = cv2.imread(test_imgpath)
    #print("img",RGB_img.shape)

    lst_template = []
    for ele in new_list:
    

        if min(ele[1]) <= 15:
            lst_template.append(RGB_img)
        # elif min(ele[1]) <= 8:
        #     print("AA")
            
            #lst_template.append(RGB_img[ele[1][0]-min_pix:ele[1][1]+min_pix,ele[1][2]-min_pix:ele[1][3]+min_pix])
        else:
            #print("nn")
            lst_template.append(RGB_img[ele[1][0]-15:ele[1][1]+15,ele[1][2]-15:ele[1][3]+15])



    #print(len(lst_template))

    # for i in lst_template:
    #     print(i.shape)
    #     input()

    detections2 = []

    for i, template in enumerate(template_list):
        # print(i)
        # print(template.shape)
        # input()
        

        results = cv2.matchTemplate(lst_template[i],template, cv2.TM_CCOEFF_NORMED)
        #print(results)
    
        match_locations = np.where(results >= round(threshold,2))
        #minval, maxval, minloc, maxloc = cv2.minMaxLoc(results) 

        for (x, y) in zip(match_locations[1], match_locations[0]):
            detections2.append({
                "TOP_LEFT_X":     int(x),
                "TOP_LEFT_Y":     int(y),
                "BOTTOM_RIGHT_X": int(x + template.shape[1]),
                "BOTTOM_RIGHT_Y": int(y + template.shape[0]),
                "MATCH_VALUE":    float(results[y, x]),
                "LABEL":          int(i + 1)
            })

    NMS_THRESHOLD = 1
    detections2 = non_max_suppression(detections2, non_max_suppression_threshold=NMS_THRESHOLD)
    # print("kuldepp",detections2)


    

    all_components = [element["LABEL"] for element in location]


    # list of labels of all the elements that are detected from the test image
    test_components = [element["LABEL"] for element in detections2]


    # list of labels of all missing components from the test image that are in the original image
    missing_components_labels = [element for element in all_components if element not in test_components]

    # list of all info of all the elements that are not present on the circuit
    missing_components = [element for element in location if element["LABEL"] in missing_components_labels]
    #print(missing_components)


    # visualizing all the results that we got from the process above (only visualizing the components that are missing from the original image)

    missing_detection_img = RGB_img.copy()

    for element in missing_components:
        cv2.rectangle(missing_detection_img, (element["TOP_LEFT_X"], element["TOP_LEFT_Y"]), (element["BOTTOM_RIGHT_X"], element["BOTTOM_RIGHT_Y"]),
        (0, 255, 255), 2)
        cv2.putText(missing_detection_img, str(element["LABEL"]), (element["TOP_LEFT_X"] + 5, element["TOP_LEFT_Y"]), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255),2)

    # cv2.imwrite("Results",missing_detection_img)
    # cv2.imshow("Missing components", missing_detection_img)
    # cv2.waitKey(0)
    # cv2.destroyAllWindows()

    return missing_detection_img


if __name__=="__main__":
    try:
        test_path='test/test1.jpeg'
        temp_path = "cropped"
        Result = template_matching(test_path,temp_path)
        
        cv2.imwrite("/home/spanidea/Downloads/front/src/Result/Results.jpeg",Result)
   
        print('cccc')
       
    except:
        print('hii')
        loc=glob.glob('scale/*')
        for i in loc:
            os.remove(i)
    



    