'use strict';
import * as dayjs from 'dayjs';

function Page (id, title, author, authorId, dateOfCreation, dateOfPublication, listContents=[]){
    this.id = id;
    this.title = title;
    this.author = author;
    this.authorId = authorId;
    this.dateOfCreation = dayjs(dateOfCreation, "YYYY-MM-DD"); 
    this.dateOfPublication = dayjs(dateOfPublication, "YYYY-MM-DD"); 
    
    this.listContents = listContents;
    this.lastCId = listContents.length+1;   

    //lista di component

    this.serialize = () => {
        let objectPage = {
            id: this.id,
            title: this.title,
            authorId: this.authorId,
            dateOfCreation: this.dateOfCreation.format('YYYY-MM-DD'),
            dateOfPublication:  this.dateOfPublication.isValid() ? this.dateOfPublication.format('YYYY-MM-DD'): null,
            contents: []
        };
        
        this.listContents.forEach((content, index) => {
            objectPage.contents.push(
                {
                    type: content.type,
                    value: content.value,
                    order: index
                }
            )
        });

        return objectPage;
    }

    this.cmpByPublicationDate = (otherPage) => {
        const thisPublicationDate = this.dateOfPublication.isValid() ? this.dateOfPublication : dayjs('9999-12-31');
        const otherPublicationDate = otherPage.dateOfPublication.isValid() ? otherPage.dateOfPublication : dayjs('9999-12-31');
    
        if (thisPublicationDate.isBefore(otherPublicationDate)) {
          return -1;
        } else if (thisPublicationDate.isAfter(otherPublicationDate)) {
          return 1;
        } else {
          return 0;
        }
      }
}

function Content (id, type, value) {
    this.id = id;
    this.type = type; // header, paragraph, or image
    this.value = value;
}

export { Page, Content };