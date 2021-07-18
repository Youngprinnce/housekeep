exports.verify_token = function(req, res, next){
	const bearerHeader = req.headers['authorization'];
	if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ')
    
    if(bearer[0] != "bearer" && bearer[0] != "Bearer"){
    res.status(401).json({
    error: "Incomplete bearer token provided"
    })
    }
    else{
    const tok = bearer[1]
    req.token = tok
    next()
    }
    }
	else {
    res.status(401).json({
    error: "No bearer token provided"
    })
    }
}