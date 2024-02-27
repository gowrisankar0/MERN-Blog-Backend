const Post = require("../models/postModel");
const User = require("../models/userModel");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const HttpError = require("../models/errorModel");
// const { post } = require("../routes/postRoutes");

const createPost = async (req, res, next) => {
  try {
    const { title, category, discription } = req.body;
    if (!title || !category || !discription || !req.files) {
      return next(new HttpError("Fill in all fields"));
    }

    const { thumbnail } = req.files;

    if (thumbnail.size > 200000) {
      return next(new HttpError("Thumbnail too big should be less than 2mb"));
    }

    let fileName = thumbnail.name;
    let splitedFilename = fileName.split(".");
    let newfilename =
      splitedFilename[0] +
      uuid() +
      "." +
      splitedFilename[splitedFilename.length - 1];

    thumbnail.mv(
      path.join(__dirname, "..", "/uploads", newfilename),
      async (err) => {
        if (err) {
          return next(new HttpError());
        } else {
          const newPost = await Post.create({
            title,
            category,
            discription,
            thumbnail: newfilename,
            creater: req.user.id,
          });

          if (!newPost) {
            return next(new HttpError("Post could't be created", 422));
          }

          const currentUser = await User.findById(req.user.id);
          const userPostCount = currentUser.posts + 1;
          await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });

          res.status(201).json(newPost);
        }
      }
    );
  } catch (error) {
    return next(new HttpError(error));
  }
};
//get post

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

const getPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return next(new HttpError("post does not found", 404));
    }

    res.status(200).json(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//get cat

const getCatPosts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(catPosts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//user Posts

const getUserPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ creater: id }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//edit post

// const editPost = async (req, res, next) => {
//   try {
//     let filename;
//     let newFilename;
//     let updatedPost;

//     const {id} = req.params;
//     console.log(id);

//     let { title, category, discription } = req.body;

//     if (!title || !category || discription.length < 12) {
//       return next(new HttpError("Fill in all fields", 422));
//     }


//     const oldPost = await Post.findById(id);

//     if (!oldPost) {
//       return next(new HttpError("Post not found", 404));
//     }
    

//     if(req.user.id===oldPost.creater){

//       if (!req.files) {
//       updatedPost = await Post.findByIdAndUpdate(
//         id,
//         { title, category, discription },
//         { new: true }
//       );
//     } else {
      

//       fs.unlink(
//         path.join(__dirname, "..", "uploads", oldPost.thumbnail),
//         async (err) => {
//           if (err) {
//             return next(new HttpError(err));
//           }

//           //upload new thumbnail
//         }
//       );

//       const { thumbnail } = req.files;

//       if (thumbnail.size > 20000000) {
//         return next(
//           new HttpError("thumnail is too big .should be less than 2mb")
//         );
//       }

//       filename = thumbnail.name;
//       let splitedFilename = filename.split(".");
//       newFilename =
//         splitedFilename[0] +
//         uuid() +
//         "." +
//         splitedFilename[splitedFilename.length - 1];

//       thumbnail.mv(
//         path.join(__dirname, "..", "/uploads", newFilename),
//         async (err) => {
//           if (err) {
//             return next(new HttpError(err));
//           }
//         }
//       );

//          updatedPost = await Post.findByIdAndUpdate(
//         id,
//         { title, category, discription, thumbnail: newFilename },
//         { new: true , runValidators: true }
//       );
//     }};

//     console.log(updatedPost);

//     if (!updatedPost) {
//       return next(new HttpError("could't update post", 400));
//     }

//     res.status(200).json(updatedPost);
//   } catch (error) {
//     return next(new HttpError(error));
//   }
// };



const editPost = async(req,res,next)=>{
  try {

 let fileName;
 let newFileName;
 let updatedPost;

 const postId = req.params.id;

 let {title,category,discription} = req.body;


 if(!title || !category || discription.length<12) {
  return next(new HttpError("Fill in all fields",422))
 }

 console.log(title,category,discription);


if(!req.files){
  updatedPost =await Post.findByIdAndUpdate(postId,{title,category,discription},{new:true})
}else{

   
   const oldPost = await Post.findById(postId);
   if(req.user.id==oldPost.creater){

  

    fs.unlink(path.join(__dirname,"..","uploads",oldPost.thumbnail),async(err)=>{

      if(err){
          return next(new HttpError(err))
      }


      

    })
    const {thumbnail} = req.files;

    if(thumbnail.size>2000000) {
      return next(new HttpError("thumnail is too big ,should be less than 2 mb"))
    }

    fileName = thumbnail.name;
    let splitedFilename = fileName.split(".");
    newFileName = splitedFilename[0] + uuid() + "." +splitedFilename[splitedFilename.length-1];

    thumbnail.mv(path.join(__dirname,"..","uploads",newFileName),async(err)=>{

      if(err){
        return next(new HttpError(err))
      }

    });

    updatedPost =await Post.findByIdAndUpdate(postId,{title,category,discription,thumbnail:newFileName},{new:true})

}}

if(!updatedPost){
  return next(new HttpError("could't update the Post",400))
}

   res.status(200).json(updatedPost) 
  } catch (error) {
     return next(new HttpError(error));
  }
}





//delete post

const deletePost = async(req,res,next)=>{
  try {


     const postId = req.params.id;

     if(!postId){
       return next(new HttpError("Post Unavailable",400))
     }

     const post = await Post.findById(postId)
     const fileName = post.thumbnail;

     if(req.user.id == post.creater){

     
     
     //delete thumnail from  uploads folder

     fs.unlink(path.join(__dirname,"..","uploads",fileName),async(err)=>{
      if(err){
        return next(new HttpError(err))
      }else{
        await Post.findByIdAndDelete(postId);
 
         //find user and delete count 
         const currentUser = await User.findById(req.user.id);
         const userPostCount = currentUser.posts-1

        await User.findByIdAndUpdate(req.user.id,{posts:userPostCount})
        res.json(`post ${postId} deleted successfully`)


      }
     });

     }else{
      return next(new HttpError("Post could't be deleted",403))
     }
    
  } catch (error) {
    return next(new HttpError(error));
  }
}


module.exports = {
  createPost,
  getPosts,
  getPost,
  getCatPosts,
  getUserPosts,
  editPost,
  deletePost,
};
