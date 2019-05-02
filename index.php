<?php
    require 'includes/config.php';
?>

<!DOCTYPE html>
<html>

<head>
    <title>Title</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content=""> 

    <link href="css/normalize.css" rel="stylesheet">
    <link href="css/fonts.css" rel="stylesheet">
    <link href="css/styles.css" rel="stylesheet">
    <link href="css/jShogi.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700&amp;subset=cyrillic" rel="stylesheet">

</head>

<body>

    <?php
        include 'header.php';
    ?>

        <section>

            <div class="container"></div>           
            <div class="information"></div>
           
        </section>

    <?php
        include 'footer.php';
    ?>

</body>

    <script src="js/jquery-3.3.1.js"></script>
    <script src="js/jquery-ui.min.js"></script>
    <!--<script src="js/jShogi-0.0.3.min.js"></script>-->
    <script src="js/kifup.js"></script>
    <script src="js/kifu.js"></script>
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js"></script>
	<![endif]-->

</html>