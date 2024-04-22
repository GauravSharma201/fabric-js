import "./annotationScreen.css";

import React, { useRef, useState, useEffect, useContext } from "react";

import {

FormInp,

FormSelectInp,

RadioBtnInpFaceDetection,

} from "../../../utility/formElements/formElements";

import FormInpWrpprFaceDetection from "../../../utility/styleWrpprComponents/formInpWrpprFaceDetection/formInpWrpprFaceDetection";

import { FileSyncButton } from "../../../utility/button/button";

import { toast } from "react-toastify";

import {

sendImageAnnotationData,

fetchImgAnnUsrProgress,

saveImageAnnUserProgress,

} from "../../../action/action";

import LoadingComponent from "../../../utility/loadingSpinner/loadingSpinner";

import { useDropzone } from "react-dropzone";

import { fabric } from "fabric";

import Radio from "@mui/material/Radio";

import randomColor from "randomcolor";

import { MyContext } from "../../../context/context";

import { LoaderWithOverlayBlur } from "../../../utility/loadingSpinner/loadingSpinner";

import {

waitingFunction,

// saveAnnotationDataToLocalStrg,

checkLocStrgTimeDiffImgAnn,

} from "../../../utility/functions/helperFunc";

import { Tooltip } from "react-tooltip";



// ------------------- REACT ICONS ----------------------------



import { IoMdAdd, IoMdClose } from "react-icons/io";

import { RiRefreshLine, RiDeleteBin6Line } from "react-icons/ri";

import { PiCursorLight } from "react-icons/pi";

import { LuBoxSelect } from "react-icons/lu";

import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";

import { IoBanOutline } from "react-icons/io5";

import {

FaRegArrowAltCircleLeft,

FaRegArrowAltCircleRight,

} from "react-icons/fa";

import { LiaBrailleSolid, LiaEye } from "react-icons/lia";

import { width } from "@mui/system";



// ------------------- REACT ICONS ----------------------------



let idNum = 0,

annotationPGArr = ["primary", "secondary"],

radioBtnArr = [

{

value: "face",

name: "model_type",

label: "Face",

},

{

value: "object",

name: "model_type",

label: "Object",

},

{

value: "count",

name: "model_type",

label: "Count",

},

{

value: "gesture_and_posture",

name: "model_type",

label: "Gesture and Posture",

},

];



function AnnotationScreen() {

const [classificationCoord, setClassificationCoord] = useState(null);

const [classList, setClassList] = useState([]); // temp class list...

const [selClassList, setSelClassList] = useState([{ id: "", name: "" }]); // selected class

const [coordiListToSend, setCoordiListToSend] = useState([]);

const [isLoadingUpload, setIsLoadingUpload] = useState(false);

const [binaryImage, setBinaryImage] = useState(null); // binary image form...

const [selLabelSelDrpDwn, setSelLabelSelDrpDwn] = useState(

"Select annotation class"

);



const [userprogLoading, setUserprogLoading] = useState(false);

const [selRadioVal, setSelRadioVal] = useState("face");

const [formDetails, setFormDetails] = useState({

anntn_class: "",

});

const [formDetailsErr, setFormDetailsErr] = useState({

anntn_class: "",

});



const [annotnPGIndx, setAnnotnPGIndx] = useState(0);

// const annotnPGIndxRef = useRef(0);



const { imgAnnotation } = useContext(MyContext);



/*

imgAnnotation: {

preAnnotationData,

handleSetPreAnnData,

}

*/



// ---------------- drop-zone ----------------



const { getRootProps, getInputProps, isDragActive } = useDropzone({

onDrop,

multiple: true,

directory: true, // Allow dropping directories

accept: { "image/*": [] },

});



const [anntionImgList, setAnntionImgList] = useState([]);

const [anntionImgUrlList, setAnntionImgUrlList] = useState([]);



const imgAnnClassListRef = useRef([...imgAnnotation.annClassList]);



async function onDrop(acceptedFiles, rejecttedFiles) {

// console.log("getting data on drop =========>", acceptedFiles);



setIsLoadingUpload(true);

setAnntionImgList(acceptedFiles);

setIsLoadingUpload(false);

toast.success("images uploaded successfully");



// ----------- creating image url array ---------



function fileToImgUrl(imgArr) {

setAnntionImgUrlList([]);

imgArr?.forEach((imgFile) => {

const reader = new FileReader();



reader.onload = (event) => {

const imageUrl = event.target.result;

setAnntionImgUrlList((prev) => {

return [...prev, imageUrl];

});

};



reader.readAsDataURL(imgFile);

});

}

fileToImgUrl(acceptedFiles);



// ----------- creating image url array ---------

}



// ---------------- drop-zone ----------------



function addCoordClass() {

if (isWhitespaceOrEmpty(formDetails?.anntn_class)) {

toast.warn("please enter a valid value");

return;

}

setClassList([...classList, { name: formDetails?.anntn_class, id: idNum }]);

idNum += 1;

setFormDetails({

anntn_class: "",

});

}



function isWhitespaceOrEmpty(str) {

// Remove whitespace characters from the beginning and end of the string

const trimmedStr = str.trim();



// Check if the trimmed string is empty or contains only whitespace

return trimmedStr.length === 0;

}



function handleSetInpforform(e) {

let val = e.target.value,

name = e.target.name;

setFormDetails({ ...formDetails, [name]: val });

}



function handleSelFromClassList(e) {

// console.log("getting select values ==>", e[0]);

setSelClassList([{ ...e[0] }]);

// setAddStorageDetl({ ...addStorageDetl, type: e[0]?.name });

setSelLabelSelDrpDwn(e[0]?.name);

// setFormDataJobDetl({ ...formDataJobDetl, pre_trend_model: e[0]?.name });

}



function handleUpdateCoordiToSend(newCoordi = [], reset = false) {

if (reset) {

setCoordiListToSend([]);

return;

}

setCoordiListToSend([...coordiListToSend, [...newCoordi]]);

}



async function handleSendAnnotationData() {

let classListArr = classList?.map((e) => e?.name);

let obj = {

object_array: classListArr,

object_len: classList.length,

image_data: binaryImage || "",

coordinates: coordiListToSend,

};



// console.log("data to send for annotation ====>", obj);

toast.warn("sending data for annotation");

let resp = await sendImageAnnotationData(obj);



if (resp?.success) {

// console.log("response from annotation api ====>", resp?.data);

toast.success("data sent for annotation");

} else {

toast.error("error sending data");

}

}



function handleUpdateBinaryImage(b) {

setBinaryImage(b);

}



function resetClassList() {

setClassList([]);

setSelClassList([{ id: "", name: "" }]);

setSelLabelSelDrpDwn("Select annotation class");

}

/*



{



object_array: [ 'body', 'face', 'gate', notic_board' ],

object_len: 4,

image_data: "image string.........",

coordinates: [   [ 1,x,y,w,h], [0,x,y,w,h], [3,x,y,w,h] ]



}



*/



function handleRadioBtnChange(x) {

let value = x?.target?.value;

// console.log("selected radio btn value ===>", value);

// setSelRadioList([{value:x?.value}])

setSelRadioVal(value);

}



async function handleClickNextBtn() {

// console.log("selected training model ======>", selRadioVal);

if (annotnPGIndx) {

// console.log(

//   "click approve img annotation fabric ==>",

//   imgAnnotation.fabricCanRefList.current

// );

// console.log(

//   "click approve img annotation class  ==>",

//   imgAnnClassListRef.current

// );



let cls = [];

imgAnnClassListRef.current?.forEach((elem) => {

let obj = { id: elem.id, name: elem.name, color: elem.color };



cls.push(obj);

});



let annInfo = [];



imgAnnotation.fabricCanRefList.current?.forEach((elem) => {

let bckImg = elem.backgroundImage._originalElement.currentSrc;

// console.log("logging background image ===>",bckImg);

let objectsArr = elem._objects;

let metaDataArr = [];



objectsArr?.forEach((o) => {

let annClass = JSON.parse(o?.annotation_class);

let objClass = {};

objClass["height"] = o.height;

objClass["width"] = o.width;

objClass["top"] = o.top;

objClass["left"] = o.left;

objClass["class"] = annClass;

metaDataArr.push(objClass);

});



annInfo.push({

background_image: bckImg,

metaData: metaDataArr,

});

});



console.log(

"data to save for pickle file: ===>",

"  clss:  ",

cls,

"   annInfo:    ",

annInfo

);



let resp = await sendImageAnnotationData({

class: [...cls],

ann_info: [...annInfo],

});



if (resp?.success) {

console.log("response from annotation api ====>", resp?.data);

toast.success("data sent for annotation");

} else {

toast.error("error sending data");

}

} else {

if (!anntionImgList[0]) toast.warn("please select some images");

let data = {

imgList: anntionImgList,

trainModel: selRadioVal,

};

// return;

imgAnnotation?.handleSetPreAnnData(data);

setAnnotnPGIndx((prev) => {

if (prev < 1 && anntionImgList[0]) {

prev += 1;

}

return prev;

});

}

}



async function handleClickResetBtn() {

if (!annotnPGIndx) {

imgAnnotation?.handleSetPreAnnData(null);

setAnntionImgList([]);

setAnntionImgUrlList([]);

// console.log("clicking reset btn if block");

} else {

// console.log("clicking reset btn else block");

setUserprogLoading(true);

setAnnotnPGIndx(0);

setAnntionImgList([]);

setAnntionImgUrlList([]);

await imgAnnotation?.handleClearAnnUsrprogress();

setUserprogLoading(false);

}

}



useEffect(() => {

imgAnnClassListRef.current = imgAnnotation.annClassList;

}, [imgAnnotation.annClassList]);



useEffect(() => {

async function imgAnnProgressRegulator() {

if (annotnPGIndx) {

// console.log(

//   "getting session data ===>",

//   imgAnnotation.saveFabricSession

// );



window.scrollTo({

top: document.body.scrollHeight,

behavior: "smooth",

});

} else {

if (imgAnnotation.forceClearUsrData) {

// console.log("inside force stop clear ann data ...");

imgAnnotation.handleUpdateForceClearUsrData(false);

return;

}

if (imgAnnotation.stopfetchUsrProg) {

setUserprogLoading(true);

// return;

await imgAnnotation.handleUpdateStopfetchUsrProg(false);

await waitingFunction(500);

}

setUserprogLoading(true);



let locStrgTimeDiff = checkLocStrgTimeDiffImgAnn(); // .... checking local strg for data on reload.



if (locStrgTimeDiff === false) {

await waitingFunction(2000);

}



let imgAnnUSrProgress = await fetchImgAnnUsrProgress();

setUserprogLoading(false);

let annotation_data =

imgAnnUSrProgress?.data?.data?.data?.annotation_obj;

if (imgAnnUSrProgress?.success && Object.keys(annotation_data).length) {

// console.log(

//   "getting user ann progress data from server===>",

//   imgAnnUSrProgress.data?.data?.data?.annotation_obj

// );

let fabric_value = annotation_data?.fabric_value,

class_value = annotation_data?.class_value;



// console.log(

//   "got fabric canvas data from fetch ===>",

//   fabric_value,

//   class_value

// );



imgAnnotation.handleUpdateSessionData(fabric_value);

imgAnnotation.handleUpdateAnnClassList(class_value);



setAnnotnPGIndx(1);

// annotnPGIndxRef.current = 1;

let imgListBySessionData = [];

fabric_value?.forEach((elem) => {

let imgSrc = elem?.backgroundImage?.src;

imgListBySessionData.push(imgSrc);

});

setAnntionImgList([...imgListBySessionData]);

} else {

// console.log(

//   "problem getting user ann progress: ===>",

//   imgAnnUSrProgress?.data?.message

// );

}

}

}

imgAnnProgressRegulator();



function handleBeforeUnload(event) {

if (!annotnPGIndx) {

// console.log("returing without saving n refresh/leaving page...");

return;

}

let msg = "Are you really want to reload the page";

event.returnValue = msg;

// alert("do you really want to reload!");



let myFabricJSONData = [];



imgAnnotation.fabricCanRefList.current?.map((elem) => {

let jsonData = elem.toJSON(["annotation_class"]);

myFabricJSONData.push(jsonData);

});



// console.log("image annotation fabric JSON list ==>", imgAnnotation.fabricCanRefList.current);

// console.log(

//   "image annotation class list ==>",

//   imgAnnClassListRef.current

// );



localStorage.setItem("IMGANNOTATIONTIMELOG", Date.now());



saveImageAnnUserProgress({

fabric_value: myFabricJSONData || [],

class_value: imgAnnClassListRef.current || [],

});



return msg;

}

window.addEventListener("beforeunload", handleBeforeUnload);



return () => {

window.removeEventListener("beforeunload", handleBeforeUnload);

};

}, [annotnPGIndx]);



return (

<>

<LoaderWithOverlayBlur isLoading={userprogLoading}>

<div className="connect_storage_screen_container">

<h2>Image Annotation</h2>

<p className="connect_storage_screen_container_p">

Upload Image for Annotation{" "}

</p>

{annotationPGArr[annotnPGIndx] === "primary" && (

<>

<p className="annotation_page_p_sub_head">Select Model Type</p>

<FormInpWrpprFaceDetection>

<RadioBtnInpFaceDetection

label="Model Type"

radioList={radioBtnArr}

handleChange={(x) => handleRadioBtnChange(x)}

selectedValue={selRadioVal}

/>

</FormInpWrpprFaceDetection>



{/* <p className="annotation_page_p_sub_head">Annotation Class</p> */}



{/* <div className="inp_page_ai_model_flex_form_inp_cont align_center">

<FormInpWrpprFaceDetection>

<FormInp

title={"Annotation Class"}

placeHldr={"Enter Annotation Class"}

nameStr={"anntn_class"}

value={formDetails?.anntn_class}

handlChange={(e) => handleSetInpforform(e)}

error={

formDetailsErr?.anntn_class && "Field can't be left empty"

}

isDisable={false}

/>

</FormInpWrpprFaceDetection>

<div className="remove_btn_margin">

<FileSyncButton

title="Add"

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

handleClick={() => addCoordClass()}

>

<IoMdAdd style={{ marginRight: ".5rem" }} />

</FileSyncButton>

</div>



<div

className="selectElementWrppr_attndnc_mngment width_image_anntn_pg align_center"

style={{ display: "flex" }}

>

<FormInpWrpprFaceDetection>

<FormSelectInp

title={"Select Annotation Class"}

placeHldr={"Select Annotation Class..."}

multiSel={false}

handlChange={handleSelFromClassList}

optionList={classList} // selelemListData usersList

selProdList={selClassList}

initialLabelDropDown={selLabelSelDrpDwn}

// error={

//     formDataErrorObj?.pre_trend_model &&

//     "Please select a model to continue"

// }

unableSearch={false}

/>

</FormInpWrpprFaceDetection>

<RiRefreshLine

size={18}

style={{ cursor: "pointer" }}

onClick={resetClassList}

/>

</div>

</div> */}



{/* --------------------- DRAG AND DROP IMAGE UPLOAD --------------------- */}



{isLoadingUpload && (

<div className="notif_wrppr_upload_screen">

<div className="loadingSpinner_wrppr_upload_file_screen">

<LoadingComponent

styl={{

bottom: "0px",

right: "0px",

position: "relative",

}}

size={"14px"}

/>

</div>

Loading files wait...

</div>

)}

<div

className={`dropzoneWrpprFD image_annotation_drop_zone ${

anntionImgList.length ? "drop_zone_got_img_anntion_pg" : ""

}`}

>

<div

{...getRootProps()}

className={`dropzoneDashBorder ${

anntionImgList.length ? "img_ann_label_container" : ""

}`}

>

<input {...getInputProps()} />

{anntionImgList.length ? (

anntionImgUrlList?.map((imgElem) => {

// console.log("got image from image list ==>", imgElem);

return (

<img

src={imgElem}

alt="uploaded image"

className="drop_zone_img_label_ann_pg"

/>

);

})

) : (

<>

<button className="dropzoneUpldIconFD">

<svg

xmlns="http://www.w3.org/2000/svg"

width="24"

height="24"

viewBox="0 0 24 24"

fill="none"

>

<path

d="M12 5.25C10.0137 5.25 8.28809 6.17871 7.05469 7.54688C6.95215 7.53516 6.86133 7.5 6.75 7.5C5.10059 7.5 3.75 8.85059 3.75 10.5C2.45215 11.291 1.5 12.627 1.5 14.25C1.5 16.7256 3.52441 18.75 6 18.75H9.75V17.25H6C4.33594 17.25 3 15.9141 3 14.25C3 13.0049 3.75586 11.9414 4.82812 11.4844L5.34375 11.2734L5.27344 10.7109C5.25879 10.5879 5.25 10.5176 5.25 10.5C5.25 9.66211 5.91211 9 6.75 9C6.85547 9 6.97266 9.01465 7.10156 9.04688L7.57031 9.16406L7.85156 8.78906C8.8125 7.55566 10.3125 6.75 12 6.75C14.458 6.75 16.5088 8.44043 17.0859 10.7109L17.2266 11.2969L17.8594 11.2734C18.0176 11.2646 18.0527 11.25 18 11.25C19.6641 11.25 21 12.5859 21 14.25C21 15.9141 19.6641 17.25 18 17.25H14.25V18.75H18C20.4756 18.75 22.5 16.7256 22.5 14.25C22.5 11.8828 20.6338 9.9873 18.3047 9.82031C17.3877 7.18066 14.9443 5.25 12 5.25ZM12 11.25L9 14.25H11.25V20.25H12.75V14.25H15L12 11.25Z"

fill="#05306B"

/>

</svg>

</button>

<p>

{isDragActive

? "Drop files here..."

: "Drag / click to upload files or folders here"}

<br />

<span>Click Here to Upload / Choose Folder Path</span>

</p>

</>

)}

</div>

</div>



{/* --------------------- DRAG AND DROP IMAGE UPLOAD --------------------- */}

</>

)}

{annotationPGArr[annotnPGIndx] === "secondary" && (

<ImageAnnotationEditingPG imageList={anntionImgList} />

)}

<div className="selStorageModalActvArea_btnWrppr margin_top_append">

<FileSyncButton

title="Reset"

stylObj={{

background: "white",

color: "#05306B",

// boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

handleClick={handleClickResetBtn}

/>

<FileSyncButton

title={annotnPGIndx ? "Approve" : "Next"}

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

handleClick={handleClickNextBtn}

/>

</div>

</div>

</LoaderWithOverlayBlur>

</>

);

}



export default AnnotationScreen;



function ImageAnnotationEditingPG({ imageList = [] }) {

const [activeFabricCanIndx, setActiveFabricCanIndx] = useState(0);

const [actvCatgOptBtn, setActvCatgOptBtn] = useState("class");



const { imgAnnotation } = useContext(MyContext);



/*

annClassList,

currSelectedClass,

handleAddAnnClassList,

handleChangeCurrSelClass,

*/



function handleUpdateActvFabricCanvasIndx(op = "") {

if (op === "inc") {

setActiveFabricCanIndx((prev) => {

if (prev < imageList.length - 1) {

return prev + 1;

} else {

return prev;

}

});

} else if (op === "dec") {

setActiveFabricCanIndx((prev) => {

if (prev > 0) {

return prev - 1;

} else {

return prev;

}

});

}

}



// useEffect(() => {

//   if (imgAnnotation.saveFabricSession[0]) {

//   }

// }, []);



return (

<>

<div className="annotation_editing_pg_main_container">

<div className="annotation_class_section_editing_pg">

<div className="date_range_bar_date_selector_wrppr image_anntn_pg_height">

<FileSyncButton

title="Classes"

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

borderRadius: "4px",

background: `${

actvCatgOptBtn === "class" ? "#05306b" : "#5D6B82"

}`,

}}

handleClick={() => setActvCatgOptBtn("class")}

/>



<FileSyncButton

title="Layers"

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

borderRadius: "4px",

background: `${

actvCatgOptBtn === "layer" ? "#05306b" : "#5D6B82"

}`,

}}

handleClick={() => setActvCatgOptBtn("layer")}

/>

</div>

{actvCatgOptBtn === "class"

? imgAnnotation.annClassList.map((e) => {

return (

<LabelForClassImageAnnEditPG

title={e?.name}

key={`class_label_contx_menu_${e?.id}`}

handleChange={imgAnnotation.handleChangeCurrSelClass}

radVal={e?.name}

radName="class"

selectedValue={imgAnnotation.currSelectedClass?.name}

selectedClass={imgAnnotation.currSelectedClass}

id={e?.id}

radColor={e?.color}

count={e?.count}

/>

);

})

: // Array(5)

// .fill("")

// .map(()=> <LabelForLayerImageAnnEditPG />)

""}

</div>

<div className="annotation_canvas_section_editing_pg">

{imgAnnotation.saveFabricSession[0]

? imgAnnotation.saveFabricSession?.map((elem, indx) => {

return (

<>

<ImageEditorFabric

imageList={[elem?.backgroundImage?.src]}

imageLength={imgAnnotation.saveFabricSession?.length}

handleUpdActvFabCanInx={handleUpdateActvFabricCanvasIndx}

actvFabCanInx={activeFabricCanIndx}

canvasRefID={`my_canvas_${indx}`}

sessionData={elem}

isActvFabricCanvas={activeFabricCanIndx === indx}

key={`image_editor_fabric_canvas_${indx}`}

/>

</>

);

})

: imageList?.map((imgElem, indx) => (

<ImageEditorFabric

imageList={[imgElem]}

imageLength={imageList.length}

handleUpdActvFabCanInx={handleUpdateActvFabricCanvasIndx}

actvFabCanInx={activeFabricCanIndx}

canvasRefID={`my_canvas_${indx}`}

isActvFabricCanvas={activeFabricCanIndx === indx}

key={`image_editor_fabric_canvas_${indx}`}

/>

))}

</div>

</div>

</>

);

}



function ImageEditorFabric({

selectedClass = "",

handleToSendCoordi = () => {},

handleSetBinaryImage = () => {},

imageList = [],

imageLength = 0,

actvFabCanInx = 0,

canvasRefID = "",

handleUpdActvFabCanInx,

isActvFabricCanvas = true,

currClsCrtBndBox = "",

handleUpdCurrClsCrtBndBox = () => {},

sessionData = null,

}) {

const canvasRef = useRef(null);

const fabricCanvas = useRef(null);

const rectangle = useRef(null);

const drawRect = useRef(false);

const zoomLevel = useRef(1); // Initial zoom level



const mainDivWrppr = useRef(null);



const toolValue = useRef("select");



const [actvTool, setActvTool] = useState("select");



const [contxMenuPosition, setContxMenuPosition] = useState({ x: 0, y: 0 });

const [contxMenuDisplay, setContxMenuDisplay] = useState(false);

const [initialImgResized, setInitialImgResized] = useState(false);

const [fabObjToolTipPostion, setFabObjToolTipPostion] = useState({

x: 0,

y: 0,

});

const [fabObjToolTipDisplay, setFabObjToolTipDisplay] = useState(false);

const [fabObjToolTipLabel, setFabObjToolTipLabel] = useState("I am fabric Object");

// const [actvImageIndx, setActvImageIndx] = useState(0);



const { imgAnnotation } = useContext(MyContext);



// const [annClassList, setAnnClassList] = useState([]);

// const [currSelectedClass, setCurrSelectedClass] = useState({

//   id: "",

//   name: "",

//   color: "",

// });

const currSelClssRef = useRef({ id: "", name: "", color: "", count: 0 }); // for event handlers...

const annClssListRef = useRef([]); // for event handlers...



const wasInsideMouseHover = useRef(false);



// function handleAddAnnClassList(v = { id: "", name: "", color: "" }) {

//   console.log("incoming class data to add ===>", v);

//   setAnnClassList([...annClassList, v]);

//   setCurrSelectedClass({ ...v });

//   currSelClssRef.current = v;

// }



// function handleChangeCurrSelClass(v = { id: "", name: "", color: "" }) {

//   setCurrSelectedClass({ ...v });

//   currSelClssRef.current = v;

// }



useEffect(() => {

// console.log("got images list ===>", imageList);



let w = mainDivWrppr.current.offsetWidth,

h = mainDivWrppr.current.offsetHeight;



// console.log("div container useeffect dimensions ============>", w, h);



fabricCanvas.current = new fabric.Canvas(canvasRefID, {

width: w,

height: h,

});



imgAnnotation.handleUpdateFabricCanvasRefList(fabricCanvas.current);



fabricCanvas.current.on("mouse:down", handleMouseDown);

fabricCanvas.current.on("mouse:move", handleMouseMove);

fabricCanvas.current.on("mouse:up", handleMouseUp);

fabricCanvas.current.on("mouse:over", handleMouseOver);

fabricCanvas.current.on("mouse:out", handleMouseOut);



if (sessionData) {

fabricCanvas.current.loadFromJSON(

sessionData,

fabricCanvas.current.renderAll.bind(fabricCanvas.current)

);

}



return () => {

fabricCanvas.current.off("mouse:down", handleMouseDown);

fabricCanvas.current.off("mouse:move", handleMouseMove);

fabricCanvas.current.off("mouse:up", handleMouseUp);

fabricCanvas.current.off("mouse:over", handleMouseOver);

fabricCanvas.current.on("mouse:out", handleMouseOut);



let fabricJSONDATA = fabricCanvas.current.toJSON(["annotation_class"]);

// console.log(

//   "component unmounted, annotation class list data ====>",

//   annClssListRef.current

// );

// console.log(

//   "component unmounted, loggin json data ====>",

//   fabricJSONDATA

// );

imgAnnotation.handleSaveUnfinishedProgress(

annClssListRef.current,

fabricJSONDATA

);



imgAnnotation.handleUpdateAnnClassList([]);

imgAnnotation.handleChangeCurrSelClass();

};

}, []);



useEffect(() => {

function attachImageToCanvasByIndx() {

console.log("attaching image to fabric canvas ===>");

let file = imageList[0];



const reader = new FileReader();



reader.onload = (event) => {

zoomLevel.current = 1;



const imageUrl = event.target.result;

fabric.Image.fromURL(imageUrl, (img) => {

// -------------- TEST IMAGE INSERTION BY ADDING -------------------



fabricCanvas.current.setBackgroundImage(

img,

fabricCanvas.current.renderAll.bind(fabricCanvas.current)

);



fabricCanvas.current.setWidth(img.width);

fabricCanvas.current.setHeight(img.height);



// -------------- TEST IMAGE INSERTION BY ADDING -------------------



// const scaledWidth = img.width * zoomLevel.current;

// const scaledHeight = img.height * zoomLevel.current;



// fabricCanvas.current.setWidth(scaledWidth);

// fabricCanvas.current.setHeight(scaledHeight);

});

};



reader.readAsDataURL(file);

}



// attachImageToCanvasByIndx();



!sessionData && attachImageToCanvasByIndx();

}, []);



useEffect(() => {

// ----------- adjusting zoom levels

if (isActvFabricCanvas && !initialImgResized) {

if (sessionData) {

handleImageResizeInFabric(imageList[0]);

} else {

let file = imageList[0];



const reader = new FileReader();



reader.onload = (event) => {

zoomLevel.current = 1;



const imageUrl = event.target.result;

handleImageResizeInFabric(imageUrl);

};



reader.readAsDataURL(file);

}

setInitialImgResized(true);

}

}, [isActvFabricCanvas]);



useEffect(() => {

currSelClssRef.current = imgAnnotation.currSelectedClass; // updating current ann class for fabric event handler

}, [imgAnnotation.currSelectedClass?.id]);



useEffect(() => {

annClssListRef.current = imgAnnotation.annClassList; // updating ann class list for fabric event handler

}, [imgAnnotation.annClassList]);



useEffect(() => {

// setActvTool(imgAnnotation.activeAnnTool);

toolValue.current = imgAnnotation.activeAnnTool;

}, [imgAnnotation.activeAnnTool]);



function handleImageResizeInFabric(imageUrl) {

console.log("runnig handle image resize function ====>");

fabric.Image.fromURL(imageUrl, (img) => {

// let bckImgW = img.width * zoomLevel.current,

//   bckImgH = img.height * zoomLevel.current,

//   divContW = mainDivWrppr.current.offsetWidth,

//   divContH = mainDivWrppr.current.offsetHeight;

// console.log(

//   "new image file ------------------------------------------ =======>",

//   divContH,

//   divContW

// );



console.log(

"fabric canvas image resize handling ===>",

fabricCanvas.current

);



//  --------------------------------------------    TEST CANVAS IMAGE RESIZING ------------------------------------------



let divContW1 = mainDivWrppr.current.offsetWidth,

divContH1 = mainDivWrppr.current.offsetHeight;



if (divContH1 < img.height || divContW1 < img.width) {

// console.log(

//   "div container w:   ",

//   divContW1,

//   "   div container h:  ",

//   divContH1

// );



// console.log("img w:   ", img.width, "   img h:  ", img.height);



let sclW = (divContW1 * 0.9) / img.width,

sclH = (divContH1 * 0.9) / img.height,

scaleFactor = Math.min(sclW, sclH);



// console.log("scaled w:   ", sclW, "   scaled h:  ", sclH);



// console.log("scaled factor for image to insert ===>", scaleFactor);



// let modImgHeight = Math.floor(img.width * scaleFactor),

//   modImgWidth = Math.floor(img.height * scaleFactor);



// img.scaleToWidth(modImgWidth);

// img.scaleToHeight(modImgHeight);



// console.log(

//   "mod img height:  ",

//   modImgHeight,

//   "    mod img width:   ",

//   modImgWidth

// );



// -------------- TEST IMAGE INSERTION BY ADDING -------------------



// console.log(

//   "fabric canvas background image:       ",

//   fabricCanvas.current.backgroundImage

// );



img.scaleX = scaleFactor;

img.scaleY = scaleFactor;



fabricCanvas.current.backgroundImage = img;



// fabricCanvas.current.backgroundImage.scaleToWidth(modImgWidth);

// fabricCanvas.current.backgroundImage.scaleToHeight(modImgHeight);



fabricCanvas.current.renderAll();

}

fabricCanvas.current.setWidth(img.width);

fabricCanvas.current.setHeight(img.height);



// if (divContW1 && divContH1) return;



// fabricCanvas.current.setBackgroundImage(

//   img,

//   fabricCanvas.current.renderAll.bind(fabricCanvas.current)

// );



//  --------------------------------------------    TEST CANVAS IMAGE RESIZING ------------------------------------------



//  ------------------------- zoom out loop -----------------------



// while (bckImgH > divContH || bckImgW > divContW) {

//   handleZoomOut();

//   console.log("inside while loop =======>", {

//     imgH: bckImgH,

//     imgW: bckImgW,

//     divH: divContH,

//     divW: divContW,

//   });

//   const img = fabricCanvas.current.backgroundImage;



//   bckImgW = img.width * zoomLevel.current;

//   bckImgH = img.height * zoomLevel.current;

//   // console.log("inside while loop www =======>", bckImgW);

//   // console.log("inside while loop hhh =======>", bckImgH);

// }



//  ------------------------- zoom out loop -----------------------

});

}



// const handleImageUpload = (e) => {

//   const file = e.target.files[0];

//   const reader = new FileReader();



//   reader.onload = (event) => {

//     zoomLevel.current = 1;



//     const imageUrl = event.target.result;

//     fabric.Image.fromURL(imageUrl, (img) => {

//       fabricCanvas.current.setBackgroundImage(

//         img,

//         fabricCanvas.current.renderAll.bind(fabricCanvas.current)

//       );



//       const scaledWidth = img.width * zoomLevel.current;

//       const scaledHeight = img.height * zoomLevel.current;



//       fabricCanvas.current.setWidth(scaledWidth);

//       fabricCanvas.current.setHeight(scaledHeight);

//     });

//   };



//   reader.readAsDataURL(file);

// };



const handleMouseDown = (e) => {

if (e.e.ctrlKey && toolValue.current === "rect") {

// e.e.preventDefault();

// console.log("ctrl click event triggered ===>");

setContxMenuPosition({ x: e.e.clientX, y: e.e.clientY });

setContxMenuDisplay(true);

return;

}

// console.log("toolValue.current mouse down =====>", toolValue.current);

// console.log("e.target mouse down =====>", e.target, e);



if (!currSelClssRef.current?.id && toolValue.current === "rect") {

// console.log("opening modal for adding annotation class...",e.e,fabricCanvas.current);

setContxMenuPosition({ x: e.e.clientX, y: e.e.clientY });

setContxMenuDisplay(true);

return;

} else {

setContxMenuDisplay(false);

}



if (toolValue.current === "rect" && e.target === null) {

const pointer = fabricCanvas.current.getPointer(e.e);

rectangle.current = new fabric.Rect({

left: pointer.x,

top: pointer.y,

width: 0,

height: 0,

fill: "transparent",

stroke: currSelClssRef.current?.color || "black",

strokeWidth: 3,

selectable: true,

hasControls: true,

originX: "left",

originY: "top",

});



let rectMetaData = JSON.stringify(currSelClssRef.current);

rectangle.current.set("annotation_class", rectMetaData); // storing class info to fabric object...

rectangle.current.set("fabric_canvas_id", canvasRefID);



fabricCanvas.current.add(rectangle.current);

drawRect.current = true;

} else if (toolValue.current === "select" && e.target !== null) {

const topCord = e.target.top,

leftCord = e.target.left,

heightCord = e.target.height,

widthCord = e.target.width,

selectedObj = e.target;



// console.log("selected element ====>", {

//   top: topCord,

//   left: leftCord,

//   height: heightCord,

//   width: widthCord,

//   target: selectedObj,

//   eventObj: e,

// });

}

};



const handleMouseMove = (e) => {

if (drawRect.current) {

const pointer = fabricCanvas.current.getPointer(e.e);



if (pointer.x > rectangle.current.left) {

rectangle.current.set({ width: pointer.x - rectangle.current.left });

} else {

rectangle.current.set({

left: pointer.x,

width: rectangle.current.left - pointer.x,

});

}



if (pointer.y > rectangle.current.top) {

rectangle.current.set({ height: pointer.y - rectangle.current.top });

} else {

rectangle.current.set({

top: pointer.y,

height: rectangle.current.top - pointer.y,

});

}



fabricCanvas.current.renderAll();

}

};



const handleMouseUp = (e) => {



// if(wasInsideMouseHover.current){

//   wasInsideMouseHover.current = false;

//   return;

// }



drawRect.current = false;



// console.log("mouse up e triggered ===>", e.target);

if (rectangle.current) {

let height = rectangle.current.height,

width = rectangle.current.width;



if (!height || !width) {

// console.log("removing object on mouse up ===>",rectangle.current);

fabricCanvas.current.remove(rectangle.current);

return;

}

}

if (toolValue.current === "rect" && e.target === null) {

// const topCord = e.target.top,

//   leftCord = e.target.left,

//   heightCord = e.target.height,

//   widthCord = e.target.width;



// console.log("selected element ====>", {

//   top: topCord,

//   left: leftCord,

//   height: heightCord,

//   width: widthCord,

//   target: e.target,

// });



// console.log("mouse up current rectangle object ===>",rectangle.current);



if (e.e.ctrlKey) return;

handleUpdateCountAnnClsList();

// console.log("fabric objects ===>", selectedClass?.id);

}

};



const handleMouseOver = (e) => {

console.log("fabric canvas mouse over ===>", fabricCanvas.current);



wasInsideMouseHover.current = true;

// let offSetCoordFab = fabricCanvas.current._offset;

// setFabObjToolTipPostion({ x: offSetCoordFab.left, y: offSetCoordFab.top });



if (e.target && e?.e?.ctrlKey) {

setFabObjToolTipDisplay(true);

console.log("mouse over event running...", e);

let annClss = JSON.parse(e.target.annotation_class);

console.log("class name: ===>", annClss.name);

setFabObjToolTipLabel(annClss.name);

let toolTipTop = fabricCanvas.current._offset.top + e.target.top; //

let toolTipLeft = fabricCanvas.current._offset.left + e.target.left; //



let finalTopToolTip = toolTipTop - 50;



console.log(

"tool tip position ===>      ",

"top    :  ",

toolTipTop,

"   left :   ",

toolTipLeft

);



setFabObjToolTipPostion({ x: toolTipLeft, y: finalTopToolTip });



// let targetTop = e.target.top,

//   targetLeft = e.target.left;



// const text = new fabric.Text(annClss.name, {

//   left: targetLeft, // Same X-coordinate as the rectangle

//   top: targetTop - 25, // 10px above the top of the rectangle

//   fontSize: 20, // Adjust font size as needed

//   fill: "white", // Text color

//   fontFamily: "Manrope",

//   // backgroundColor:"#6e87a9",

//   fontWeight: 500,

//   shadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",

//   stroke: "#3498db",

//   strokeWidth: 3,

// });



/*

background-color: #6e87a9;

color: white;

border-radius: 5px;

font-family: Manrope;

font-weight: 500;

font-size: 14px;

z-index: 9;

padding: 0.3rem;





*/



// fabricCanvas.current.add(text);

// fabricCanvas.current.renderAll();

}

};



const handleMouseOut = (e) => {

setFabObjToolTipDisplay(false);

}



function handleUpdateCountAnnClsList() {

let annCLsArr = [];



// console.log("fabric objects ====>", fabricCanvas?.current?._objects);

let countByClsID = {};

// fabricCanvas?.current?._objects?.forEach((e) => {

//   let obj = JSON.parse(e?.annotation_class);



//   countByClsID[obj?.id] = countByClsID[obj?.id]

//     ? countByClsID[obj?.id] + 1

//     : 1;

// });

annCLsArr = annClssListRef.current.map((e) => {

let obj = { ...e };



if (!obj["objByFabricID"]) {

obj["objByFabricID"] = {};

}

obj["objByFabricID"][canvasRefID] = fabricCanvas.current._objects.filter(

(elem) => {

let o = JSON.parse(elem.annotation_class);

return o.id === obj.id;

}

);

let cls_obj_totl_cnt = 0;

for (const fabCanvasID in obj["objByFabricID"]) {

cls_obj_totl_cnt += obj["objByFabricID"][fabCanvasID].length;

}

obj.count = cls_obj_totl_cnt;



return obj;

});

imgAnnotation.handleUpdateAnnClassList(annCLsArr);

}



const handleSelRect = () => {

toolValue.current = "rect";

};



const handleSelSelect = () => {

toolValue.current = "select";

};



const handleZoomIn = () => {

zoomLevel.current += 0.1; // Increase zoom level by 10%

fabricCanvas.current.setZoom(zoomLevel.current);



if (fabricCanvas.current.backgroundImage) {

const img = fabricCanvas.current.backgroundImage;

const scaledWidth = img.width * zoomLevel.current;

const scaledHeight = img.height * zoomLevel.current;



fabricCanvas.current.setWidth(scaledWidth);

fabricCanvas.current.setHeight(scaledHeight);

}

};



const handleZoomOut = () => {

if (fabricCanvas.current.backgroundImage) {

const img = fabricCanvas.current.backgroundImage;

let toSetZoomLevel = zoomLevel.current - 0.1;

const scaledWidth = img.width * toSetZoomLevel;

const scaledHeight = img.height * toSetZoomLevel;



if (scaledWidth >= 100 && scaledHeight >= 100) {

// console.log(

//   "zooming out fabric to dimensions: ==>",

//   "  width:  ",

//   scaledWidth,

//   " height:   ",

//   scaledHeight

// );

zoomLevel.current -= 0.1; // Decrease zoom level by 10%

fabricCanvas.current.setZoom(zoomLevel.current);



fabricCanvas.current.setWidth(scaledWidth);

fabricCanvas.current.setHeight(scaledHeight);

}

}

};



// function findCoordinates() {

//   let canvasObjs = fabricCanvas.current._objects;

//   console.log("fabric canvas element ===>", canvasObjs);

// }



function removeActvObj() {

let activeObj = fabricCanvas.current._activeObject;

// console.log("ative object ====>", activeObj);

fabricCanvas.current.remove(activeObj);



fabricCanvas.current.renderAll();

handleUpdateCountAnnClsList();

}



function handleCloseContextMenuCont() {

setContxMenuDisplay(false);

}



return (

<div

className={`main_wrppr_fabric_editor ${

isActvFabricCanvas ? "" : "in_actv_fabric_editor"

}`}

>

<div className="fabric_canvas_toolbar_wrapper_annotation_pg">

<div className="fabric_canvas_tool_wrppr_anntn_pg">

<LuBoxSelect

onClick={() => {

// setActvTool("rect");

imgAnnotation.handleActiveAnnTool("rect");

handleSelRect();

}}

className={

imgAnnotation.activeAnnTool === "rect" ? "active_tool" : ""

}

data-tooltip-id={"rectangle_button" + canvasRefID}

data-tooltip-content="rectangle"

data-tooltip-variant="info"

/>

<Tooltip

id={"rectangle_button" + canvasRefID}

style={{ fontSize: "70%" }}

/>

<PiCursorLight

onClick={() => {

// setActvTool("select");

imgAnnotation.handleActiveAnnTool("select");

handleSelSelect();

}}

className={

imgAnnotation.activeAnnTool === "select" ? "active_tool" : ""

}

data-tooltip-id={"select_button" + canvasRefID}

data-tooltip-content="select"

data-tooltip-variant="info"

/>

<Tooltip

id={"select_button" + canvasRefID}

style={{ fontSize: "70%" }}

/>

<AiOutlineZoomIn

onClick={() => {

// setActvTool("zoomIn");

imgAnnotation.handleActiveAnnTool("zoomIn");

handleZoomIn();

}}

className={

imgAnnotation.activeAnnTool === "zoomIn" ? "active_tool" : ""

}

data-tooltip-id={"zoom_in_button" + canvasRefID}

data-tooltip-content="zoom-in"

data-tooltip-variant="info"

/>

<Tooltip

id={"zoom_in_button" + canvasRefID}

style={{ fontSize: "70%" }}

/>

<AiOutlineZoomOut

onClick={() => {

// setActvTool("zoomOut");

imgAnnotation.handleActiveAnnTool("zoomOut");

handleZoomOut();

}}

className={

imgAnnotation.activeAnnTool === "zoomOut" ? "active_tool" : ""

}

data-tooltip-id={"zoom_out_button" + canvasRefID}

data-tooltip-content="zoom-out"

data-tooltip-variant="info"

/>

<Tooltip

id={"zoom_out_button" + canvasRefID}

style={{ fontSize: "70%" }}

/>

<IoBanOutline

onClick={() => {

// setActvTool("remove");

imgAnnotation.handleActiveAnnTool("remove");

removeActvObj();

}}

className={

imgAnnotation.activeAnnTool === "remove" ? "active_tool" : ""

}

data-tooltip-id={"remove_button" + canvasRefID}

data-tooltip-content="remove/delete"

data-tooltip-variant="info"

/>

<Tooltip

id={"remove_button" + canvasRefID}

style={{ fontSize: "70%" }}

/>

</div>



<div className="date_range_bar_date_selector_wrppr image_anntn_pg_height">

<FileSyncButton

title=""

stylObj={{

background: "white",

color: "#05306B",

// boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

handleClick={() => handleUpdActvFabCanInx("dec")}

>

<FaRegArrowAltCircleLeft />

</FileSyncButton>

<FileSyncButton

title={`${actvFabCanInx + 1}/${imageLength}`}

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

/>

<FileSyncButton

title=""

stylObj={{

background: "white",

color: "#05306B",

// boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

}}

handleClick={() => handleUpdActvFabCanInx("inc")}

>

<FaRegArrowAltCircleRight />

</FileSyncButton>

</div>

</div>



<ContextMenuContainer

isActv={contxMenuDisplay}

position={contxMenuPosition}

handleCloseContxMenu={handleCloseContextMenuCont}

handleAddClass={imgAnnotation.handleAddAnnClassList}

handleChangeSelClass={imgAnnotation.handleChangeCurrSelClass}

classList={imgAnnotation.annClassList}

selectedClass={imgAnnotation.currSelectedClass}

/>

<FabricObjectToolTip position={fabObjToolTipPostion} label={fabObjToolTipLabel} display={fabObjToolTipDisplay} />

<div

className="fabric_canvas_wrapper_div_annotation_pg"

ref={mainDivWrppr}

>

<div className="fabric_canvas_sub_wrapper_ann_pg">

<canvas ref={canvasRef} id={canvasRefID} />

</div>

</div>

</div>

);

}



function ContextMenuContainer({

isActv = false,

position = { x: 0, y: 0 },

classList = [],

selectedClass = "",

handleCloseContxMenu = () => {},

handleAddClass = () => {},

handleChangeSelClass = () => {},

}) {

const [inputVal, setInputVal] = useState("");

const [selectedContxLabel, setSelectedContxLabel] = useState(null);



const { imgAnnotation } = useContext(MyContext);



function handleInpChange(e) {

let val = e?.target?.value;

setInputVal(val);

}



function handleSaveClass() {

if (selectedContxLabel && inputVal.trim()) {

let fabric_canvas_list = imgAnnotation.fabricCanRefList.current,

ann_class_list = imgAnnotation.annClassList;



// console.log("annotation class ===>", ann_class_list);

// console.log("fabric canvas list ===>", fabric_canvas_list);



fabric_canvas_list?.forEach((fab_canvas) => {

let fabric_obj = fab_canvas.getObjects();

fabric_obj?.forEach((obj) => {

let o = JSON.parse(obj?.annotation_class);

if (selectedContxLabel?.id === o?.id) {

o.name = inputVal;

// console.log("object meta data fabric canvas ===>", o);

let strObj = JSON.stringify(o);

fab_canvas.set("annotation_class", strObj);

}

});

});



let new_ann_cls_list = ann_class_list.map((class_elem) => {

let obj = class_elem;

if (selectedContxLabel?.id === obj?.id) {

obj["name"] = inputVal;

}

return obj;

});



imgAnnotation.handleUpdateAnnClassList(new_ann_cls_list);

setInputVal("");

setSelectedContxLabel(null);

return;

}

if (inputVal.trim()) {

// update class list ...

if (checkClassPreExisting(inputVal)) {

toast.warn("can't add class with same name");

return;

}

let data = {

id: `ANN_ID_${new Date().getTime()}`,

name: inputVal,

color: randomColor(),

count: 0,

};

// console.log("class genrated data ==>", data);

handleAddClass(data);

setInputVal("");

} else {

toast.warn("Please enter some valid text");

}

}



function checkClassPreExisting(name) {

let ann_class_list = imgAnnotation.annClassList;

let isPreExist = false;

ann_class_list.forEach((class_elem) => {

let obj = class_elem;

if (name === obj?.name) {

isPreExist = true;

}

});



return isPreExist;

}



function handleClickAnnLabelClick(label) {

setInputVal(label?.name || "");

setSelectedContxLabel(label);

// handleChangeSelClass({id:label?.id,name:label?.name,color:label?.color});

}



function handleClickDeleteSelLabel() {

let fabric_canvas_list = imgAnnotation.fabricCanRefList.current,

ann_class_list = imgAnnotation.annClassList;



let new_class_arr = ann_class_list.filter((class_elem) => {

return class_elem?.id !== selectedContxLabel?.id;

});



imgAnnotation.handleUpdateAnnClassList(new_class_arr);



fabric_canvas_list?.forEach((fab_canvas) => {

let fabric_obj = fab_canvas.getObjects();

fabric_obj?.forEach((obj) => {

let { id } = JSON.parse(obj?.annotation_class);

if (id === selectedContxLabel?.id) {

fab_canvas.remove(obj);

}

});

});



setInputVal("");

setSelectedContxLabel(null);

}



function handleSaveClassOnEnterKey(e) {

if (e.key !== "Enter") return;

// console.log("enter key pressed !");

handleSaveClass();

}

return (

<div

className={`annotation_context_menu_main_container ${

isActv ? "contxtMenuActv" : ""

}`}

style={{ top: position.y, left: position.x }}

>

<div className="head_cont_ann_contx_menu">

<p>Annotation Editor</p>

<IoMdClose

className="close_btn_ann_cntx_menu"

onClick={handleCloseContxMenu}

/>

</div>

<div className="input_txt_ann_contx_menu">

<input

type="text"

placeholder="enter text"

onChange={handleInpChange}

onKeyDown={handleSaveClassOnEnterKey}

value={inputVal}

/>

<div className="combo_btn_inp_txt_ann_contx_menu">

<FileSyncButton

title="Delete"

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

background: "#FF004C",

}}

handleClick={handleClickDeleteSelLabel}

/>

<FileSyncButton

title="Save"

stylObj={{

boxShadow: "0px 0px 5.1px 0px rgb(225 225 225 / 88)",

color: "white",

fontFamily: "Poppins",

fontSize: "16px",

fontStyle: "normal",

fontWeight: "400",

background: "#008C6B",

}}

handleClick={handleSaveClass}

/>

</div>

</div>

<div className="class_list_ann_contx_menu">

{classList.map((e, i) => {

// console.log(

//   "context menu sel label",

//   selectedContxLabel?.name,

//   "   elem name",

//   e?.name

// );

return (

<div

onClick={() => {

handleClickAnnLabelClick(e);

}}

className={

selectedContxLabel?.name === e.name

? "contx_menu_active_label"

: ""

}

key={`class_label_contx_menu_${e?.id}`}

>

<LabelForClassImageAnnEditPG

title={e?.name}

handleChange={handleChangeSelClass}

radVal={e?.name}

radName="class"

selectedValue={selectedClass?.name}

selectedClass={selectedClass}

id={e?.id}

count={e?.count}

radColor={e?.color}

/>

</div>

);

})}

</div>

</div>

);

}



function FabricObjectToolTip({

position = { x: 0, y: 0 },

label = "Im a fabric oject",

display=true,

}) {

return (

<p

style={{ top: position.y, left: position.x }}

className={`fabricObjectToolTipLabel ${display?"actv_fab_tool_tip_label":""}`}

>

{label}

</p>

);

}



function LabelForClassImageAnnEditPG({

handleChange = () => {},

selectedValue = "a",

title = "test title",

radVal = "a",

radName = "test name",

radColor = "red",

count = 0,

id = "",

selectedClass = null,

}) {

function radioHandleChange(event) {

let value = event.target.value;

let data = {

id,

name: value,

color: radColor,

};

handleChange(data);

}



function handleClickLabel() {

let data = {

id,

name: radVal,

color: radColor,

};

handleChange(data);

}



useEffect(() => {

console.log("selected class in label ===>", selectedClass);

}, [selectedClass]);



return (

<div

className="label_for_class_img_ann_main_wrppr"

onClick={handleClickLabel}

>

<Radio

checked={selectedClass?.id === id}

onChange={radioHandleChange}

value={radVal}

name={radName}

inputProps={{ "aria-label": "A" }}

sx={{

color: radColor,

"&.Mui-checked": {

color: radColor,

},

}}

/>

<p className="label_for_class_title">{title}</p>

<p className="label_for_class_count">{count}</p>

</div>

);

}



function LabelForLayerImageAnnEditPG({

handleChange = () => {},

selectedValue = "a",

title = "test title",

radVal = "a",

radName = "test name",

radColor = "red",

count = 0,

}) {

return (

<div className="label_for_class_img_ann_main_wrppr layer_box_gap">

<LiaBrailleSolid className="layer_label_icon" />

<LiaEye className="layer_label_icon" />

<Radio

checked={selectedValue === "a"}

onChange={handleChange}

value={radVal}

name={radName}

inputProps={{ "aria-label": "A" }}

sx={{

color: radColor,

"&.Mui-checked": {

color: radColor,

},

}}

/>

<p className="label_for_class_title">{title}</p>

<RiDeleteBin6Line

color="red"

className="layer_label_icon auto_margin_left"

/>

</div>

);

}


