const mongoose = require('mongoose');
const Room = require('./models/Room');
mongoose.connect('mongodb+srv://devwooyouteam_db_user:DOMdF3hX1rQxz560@tungmantion.tzwwczq.mongodb.net/?appName=tungmantion')
.then(async () => {
    const building1Id = '69a8c43bc86938c70286f456';
    const building2Id = '69a8ce2e2bbe7c0b6590c737';

    for(let f=1; f<=4; f++) {
       for(let r=1; r<=8; r++) {
            let rStr = r.toString().padStart(2, '0');
            // Check building 1
            {
               let num = '1' + f + rStr;
               let exists = await Room.findOne({ number: num, buildingId: building1Id });
               if(!exists) {
                   console.log('Inserting b1:', num);
                   await Room.create({ number: num, buildingId: building1Id, floor: f, rent: 4500, status: 'vacant' });
               }
            }
            // Check building 2
            {
               let num = '2' + f + rStr;
               let exists = await Room.findOne({ number: num, buildingId: building2Id });
               if(!exists) {
                   console.log('Inserting b2:', num);
                   await Room.create({ number: num, buildingId: building2Id, floor: f, rent: 4500, status: 'vacant' });
               }
            }
       }
    }
    console.log('Done');
    process.exit(0);
});
