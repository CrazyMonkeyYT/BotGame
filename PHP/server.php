
<?php
/*
    server.php
    Thomas M IV Williamson
    
    description:
    saves new scorse with user name and organises them from highest to lowest on a scoreboard saved on server as ScoreBoard.json
    
    
    2024-04-28
*/
    header('Access-Control-Allow-Origin: http://localhost:3000');
    // gets score and name
    $user = $_POST['name'];
    $score = $_POST['score'];

  //sets file location  
    $filename = $_SERVER['DOCUMENT_ROOT']."/src/ScoreBoard.json";

// adds record to file
    if(file_exists($filename)){
        $string = file_get_contents($filename);
        $jsonFile = json_decode($string, true);
        $jsonFile[] = [$user,$score];
        usort($jsonFile, "sortByScore");

        // saves to existing file 
        file_put_contents($filename, json_encode($jsonFile));

    }else{
    // creates new file
        $jsonFile = array();
        $jsonFile[] =  array($user,$score);
        file_put_contents($filename, json_encode($jsonFile));
    }
    echo("score is set refresh page to try again");   


// sort function
function sortByScore($a, $b){
    if ($a[1] == $b[1]){
        return -1;
    }
    // else
    return ($a[1] > $b[1]) ? -1 : 1;
}
?>