function AllImagesPopup({
    setShowPopup,
    images
}) {
    return (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <h3>Image Reference</h3>
                <div className="image-list">
                {Object.entries(images).map(([key, path]) => (
                    <div key={key} className="image-item">
                    <img src={path} alt={key} />
                    <span>{"hider "+key+" seeker"}</span>
                    </div>
                ))}
                </div>
                <button className="close-button" onClick={() => setShowPopup(false)}>Close</button>
            </div>
        </div>
    )
}

export default AllImagesPopup;