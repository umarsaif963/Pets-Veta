const prisma = require('../config/prisma');
const { VerificationStatus } = require('@prisma/client');
const { getGoogleProfileToken } = require('../utils/googleAuth');
const { createAuthTokens } = require('../services/authToken.services');
const AppError = require('../utils/AppError');

const createDoctor = async (doctorData) => {
    return await prisma.user.create({
        data: {
            fullName: doctorData.fullName,
            email: doctorData.email,
            password: doctorData.password,
            username: doctorData.username,
            phone: doctorData.phone,
            doctors: {
                create: {
                    education: doctorData.education,
                    specialization: doctorData.specialization,
                    medicalLicenseNumber: doctorData.medicalLicenseNumber,
                    address: doctorData.address,
                    experience: parseInt(doctorData.experience),
                    fees: parseInt(doctorData.fees)
                }
            },
            doctorCertificate: {
                create: {
                    publicId: doctorData.publicId,
                    publicUrl: doctorData.publicUrl
                }
            },
            userRole: {
                create: { role: "Doctor" }
            }
        },
        include: {
            doctors: true,
            userRole: true,
            doctorCertificate: true
        }
    });
};

const createPetOwner = async (petOwnerData) => {
    if (!petOwnerData) {
        throw new AppError("Data is Invalid ", 400);
    }

    const isCreated = await prisma.user.findFirst({
        where: {
            OR: [
                { email: petOwnerData.email },
                { username: petOwnerData.username }
            ]
        }
    });

    if (isCreated) {
        return false;
    }

    try {
        const newPetOwner = await prisma.user.create({
            data: {
                fullName: petOwnerData.fullName,
                username: petOwnerData.username,
                email: petOwnerData.email,
                password: petOwnerData.hashedPassword,
                userRole: {
                    create: {
                        role: 'PetOwner'
                    }
                }
            },
            include: {
                userRole: true
            }
        });

        return newPetOwner;
    } catch (error) {
        // Unique constraint race (email/username taken between the check above
        // and this insert). P2002 is the Prisma code for a unique violation.
        if (error?.code === 'P2002') {
            return false;
        }
        throw error;
    }
};

const createAccountByGoogleService = async (code) => {
    const profile = await getGoogleProfileToken(code);

    let user = await prisma.user.findUnique({
        where: { email: profile.email },
        include: { userRole: true }
    });

    if (!user) {
        const baseUsername = profile.email.split('@')[0];
        const uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

        user = await createPetOwner({
            fullName: profile.name,
            username: uniqueUsername,
            email: profile.email,
            hashedPassword: null
        });
    }

    const userRole = user.userRole?.role || 'PetOwner';

    const payload = {
        id: user.id,
        email: user.email,
        role: userRole
    };

    const { accessToken, refreshToken } = createAuthTokens(payload);

    return { user, accessToken, refreshToken };
};

const createAdmin = async (adminData) => {
    const isCreated = await prisma.user.findUnique({
        where: {
            email: adminData.email
        }
    });

    if (isCreated) {
        return false;
    }

    const newAdmin = await prisma.user.create({
        data: {
            fullName: adminData.fullName,
            username: adminData.username,
            email: adminData.email,
            password: adminData.hashedPassword,
            isEmailVerified: true,
            userRole: {
                create: {
                    role: 'Admin'
                }
            }
        },
        include: {
            userRole: true,
            admin: true
        }
    });

    return newAdmin;
};

const loginUser = async (userData) => {
    const user = await prisma.user.findFirst({
        where: {
            email: userData.email,
            isEmailVerified: true
        },
        include: {
            userRole: true,
            doctors: true,
            admin: true
        }
    });

    if (user?.userRole?.role?.toLowerCase() === 'doctor') {
        if (user.doctors?.isVerified === VerificationStatus.PENDING) {
            throw new AppError("Unverified User is not allowed yet...", 403);
        }
    }

    return user;
};

const refreshUserToken = async (email, refreshToken) => {
    await prisma.user.update({
        where: {
            email: email
        },
        data: {
            refreshToken: refreshToken
        }
    });

    return refreshToken;
};

const verifyUsername = async (username) => {
    if (!username) {
        return false;
    }

    const validUser = await prisma.user.findFirst({
        where: {
            username: username
        }
    });

    return validUser;
};

const verifyEmail = async (email) => {
    if (!email) {
        return false;
    }

    const validUser = await prisma.user.findUnique({
        where: {
            email: email
        },
        include: {
            userRole: true,
            doctors: {
                select: {
                    isVerified: true
                }
            }


        }
    })
    if (validUser && validUser.userRole === 'DOCTOR') {
        if (validUser.doctors.isVerified === VerificationStatus.PENDING) {
            throw new AppError("Doctor is Not Allowed Yet", 400);
            return;
        }
    };

    if (!validUser) {
        return false;
    }

    const userRole = validUser.userRole?.role?.toLowerCase();

    if (
        userRole === 'doctor' &&
        validUser.doctors?.isVerified === VerificationStatus.PENDING
    ) {
        throw new AppError("Doctor is Not Allowed Yet", 400);
    }

    return validUser;
};

const getUserById = async (id) => {
    if (!id) {
        return false;
    }

    const user = await prisma.user.findUnique({
        where: {
            id: id
        },
        include: {
            userRole: true
        }
    });

    return user;
};

const getUserWithRole = async (email) => {
    return await prisma.user.findUnique({
        where: {
            email
        },
        include: {
            userRole: true,
            doctors: true,
            admin: true
        }
    });
};

const saveUserOtp = async (email, userOtp) => {
    const user = await prisma.user.update({
        where: {
            email: email
        },
        data: {
            otp: userOtp
        }
    });

    return user;
};

const updateOtpField = async (email) => {
    const user = await prisma.user.update({
        where: {
            email: email
        },
        data: {
            otp: "",
            isEmailVerified: true
        }
    });

    return user;
};

const updateUserPassword = async (id, password) => {
    const user = await prisma.user.update({
        where: {
            id: id
        },
        data: {
            password: password
        }
    });

    return user;
};

module.exports = {
    createDoctor,
    createPetOwner,
    loginUser,
    refreshUserToken,
    verifyEmail,
    saveUserOtp,
    updateOtpField,
    getUserWithRole,
    updateUserPassword,
    createAdmin,
    getUserById,
    verifyUsername,
    createAccountByGoogleService
};