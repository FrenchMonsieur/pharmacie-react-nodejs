export async function guard_login(req, res, next) {
    if (!req.session.utilisateur) {
        return res.status(401).json({ erreur: 'Utilisateur non connecté.' });
    }
    else {
        next();
    }
}

export async function guard_admin(req, res, next) {
    if (req.session.utilisateur.role !== 'admin') {
        return res.status(403).json({ erreur: 'Accès refusé. Rôle administrateur requis.' });
    }
    else {
        next();
    }
}

export async function guard_fournisseur(req, res, next) {
    if (req.session.utilisateur.role !== 'fournisseur') {
        return res.status(403).json({ erreur: 'Accès refusé. Rôle fournisseur requis.' });
    }
    else {
        next();
    }
}

export async function guard_professionnel(req, res, next) {
    if (req.session.utilisateur.role !== 'professionnel') {
        return res.status(403).json({ erreur: 'Accès refusé. Rôle professionnel requis.' });
    }
    else {
        next();
    }
}

