import cv2 
import json

image = cv2.imread("originalImage/Train.jpeg")

f = open('json/01.json')

cor = json.load(f)


crop_img = image[cor['TOP_LEFT_Y']:cor['BOTTOM_RIGHT_Y'],cor['TOP_LEFT_X']:cor['BOTTOM_RIGHT_X']]

cv2.imwrite("cropped/"+ cor['filename']+".jpeg",crop_img)
