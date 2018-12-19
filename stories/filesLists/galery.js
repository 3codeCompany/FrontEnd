import React from 'react';
import {Gallery} from '../../src/ctrl/FilesLists';

class GalleryBase extends React.Component {

    render() {
        let files = [
            {
                key: 1,
                name: 'image 1',
                path: 'https://static.pexels.com/photos/20974/pexels-photo.jpg',
                thumbnail: false,
            },
            {
                key: 2,
                name: 'image 2',
                path: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Hopetoun_falls.jpg',
                thumbnail: false,
            },
            {
                key: 3,
                name: 'image 3',
                path: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cucumber_leaf.jpg/600px-Cucumber_leaf.jpg',
                thumbnail: false,
            },
            {
                key: 4,
                name: 'image 4',
                path: 'http://cdn.playbuzz.com/cdn/925704be-9b8e-4dfc-852e-f24d720cb9c5/bcf39e88-5731-43bb-9d4b-e5b3b2b1fdf2.jpg',
                thumbnail: false,
            },

        ];


        let endpoint = 'http://localhost:3001/form/fileUpload';


        return (
            <div><Gallery
                files={files}
                endpoint={endpoint}
                onDragEnd={(e) => alert("drag")}
                /*onClick={(e) => alert("click")}*/
                onDelete={(e) => alert("delete")}
                onRename={(e) => alert("edit")}
            /></div>
        )
    }
}

export {GalleryBase}