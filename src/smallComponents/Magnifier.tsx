


const magnifierHeight = 100
const magnifierWidth = 100
const zoomLevel = 1.5

const Magnifier = ({showMagnifier, imageUrl, imgWidth, imgHeight, y, x}:
    {showMagnifier: boolean, imageUrl: string, imgWidth: number, imgHeight: number, y: number, x: number}) => {


	return (
		<div
            style={{
            display: showMagnifier ? "" : "none",
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: "1",
            border: "1px solid lightgray",
            backgroundColor: "white",
            backgroundImage: `url('${imageUrl}')`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${imgWidth * zoomLevel}px ${
                imgHeight * zoomLevel
            }px`,
                backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
                backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`
            }}
        >
        </div>
	);
};

export default Magnifier;