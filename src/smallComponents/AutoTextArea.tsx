import React, {useState, useRef,} from "react";

const MAX_ROWS = 10
const MIN_ROWS = 3

const AutoTextArea = ({setText, text, title}:{
    setText: React.Dispatch<React.SetStateAction<string>>, text: string, title: string}) => {
    const [rows, setRows] = useState(MIN_ROWS)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);  
	  

    const handleChange = (event: any) => {
		const textareaLineHeight = 24;;
		
		const previousRows = event.target.rows;
  	    event.target.rows = MIN_ROWS; // reset number of rows in textarea 
		
		const currentRows = ~~(event.target.scrollHeight / textareaLineHeight);
    
        if (currentRows === previousRows) {
            event.target.rows = currentRows;
        }
		
		if (currentRows >= MAX_ROWS) {
			event.target.rows = MAX_ROWS;
			event.target.scrollTop = event.target.scrollHeight;
		}
        
        setText(event.target.value)
  	    setRows(currentRows < MAX_ROWS ? currentRows : MAX_ROWS)
    
	};

	return (
		<div >
            <label htmlFor={`${title}`}>{title}</label>
			<textarea
                className="review-text-area"
                value={text}
                id={`${title}`}
				ref={textareaRef}
				rows={rows}
				style={{
                    width: "100%",
                    display: "block",
                 
				}}
				onChange={handleChange}
			/>
		</div>
	);
};

export default AutoTextArea;