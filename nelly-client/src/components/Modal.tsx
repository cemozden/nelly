import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
    title : string,
    visible : boolean
}

const modalRoot = document.getElementById('modal-root');

const Modal : React.FC<ModalProps> = props => {
    const modal = document.createElement('div');

    useEffect(() => {
        modalRoot?.appendChild(modal);

        return function cleanup() {
            modalRoot?.removeChild(modal);
        }
    });

    function closeModal(event : React.MouseEvent) {
        const nellyModal : any = document.getElementById('nellyModal');
        nellyModal.style.display = 'none';
    }
    
    return createPortal(
        <div id="nellyModal" style={props.visible ? {display : 'block'}: {display : 'none'}} className="modal">
            <div className="modal-content">
                <div className="modal-header">
                    <span className="close" onClick={closeModal}>&times;</span>
                    <h3>{props.title}</h3>
                </div>
                {props.children}
            </div>
        </div>, modal);
}

export default Modal;