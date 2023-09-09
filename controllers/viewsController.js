const Tour = require('../models/tourModel');

const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get tour data from collection
  const tours = await Tour.find();

  // 2) build template

  // 3) render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All tours',
    tours, // tours is an array containing multiple cards
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  // 2) build template
  // 3) Render template using data from 1)
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )

    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

// exports.login = catchAsync(async (req, res) => {
//   const { email, password } = req.body;

//   // Find the user by email
//   const user = await User.findOne({ email });

//   // Check if the user exists
//   if (!user) {
//     return res.status(401).json({ message: 'Invalid email or password' });
//   }
//   // Compare the provided password with the hashed password stored in the database
//   const passwordMatch = await bcrypt.compare(password, user.password);

//   // If passwords match, generate a JWT token
//   if (passwordMatch) {
//     // Replace 'your-secret-key' with a strong secret key for JWT
//     const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
//       expiresIn: '1h', // Token expires in 1 hour (you can adjust this)
//     });

//     return res.status(200).json({ token });
//   }
//   return res.status(401).json({ message: 'Invalid email or password' });
// });
