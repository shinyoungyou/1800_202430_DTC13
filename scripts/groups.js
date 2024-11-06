function writeHikes() {
    //define a variable for the collection you want to create in Firestore to populate data
    var hikesRef = db.collection("hikes");

    groupsRef.add({
        name: "Group 1",
        number_of_members: 50,
        created_by: "Maria",
        is_my_group : true,
        user : ""
        
    });

    groupsRef.add({
        name: "Group 2",
        number_of_members: 45,
        created_by: "Kiana",
        is_my_group : true,
        user : ""
        
    });

    groupsRef.add({
        name: "Group 3",
        number_of_members: 50,
        created_by: "Shinyoung",
        is_my_group : true,
        user : ""
        
    });

    groupsRef.add({
        name: "Group 4",
        number_of_members: 50,
        created_by: "Raman",
        is_my_group : true,
        user : ""
        
    });

    groupsRef.add({
        name: "Group A",
        number_of_members: 30,
        created_by: "Emily",
        is_my_group : false,
        user : ""
        
    });

    groupsRef.add({
        name: "Group B",
        number_of_members: 53,
        created_by: "Sarah",
        is_my_group : false,
        user : ""
        
    });

    groupsRef.add({
        name: "Group C",
        number_of_members: 20,
        created_by: "Michael",
        is_my_group : false,
        user : ""
        
    });

    groupsRef.add({
        name: "Group D",
        number_of_members: 65,
        created_by: "Noah",
        is_my_group : false,
        user : ""
        
    });

    groupsRef.add({
        name: "Group E",
        number_of_members: 47,
        created_by: "Benjamin",
        is_my_group : false,
        user : ""
        
    });
    
}