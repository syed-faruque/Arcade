/**
 * @author Syed Faruque
 * created: June 2 2024
**/

import React from "react";
import Navbar from "../components/Navbar";
import '../prettify/Styles.css';

const ListWithActions = ({ title, items, onAccept, onDecline, emptyMessage, socket }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar socket = {socket}/>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-xl mx-auto bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-3xl font-semibold mb-4 text-center">{title}</h2>
                    <div>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg flex items-center justify-between mb-4 p-4">
                                    <span className="mr-4">{item}</span>
                                    <div className="flex">
                                        <button onClick={() => onAccept(index)} className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 mr-2">Accept</button>
                                        <button onClick={() => onDecline(index)} className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">Decline</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 text-center">{emptyMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListWithActions;
