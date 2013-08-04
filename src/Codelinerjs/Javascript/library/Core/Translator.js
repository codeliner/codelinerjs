/**
 * The Cl.Core.Translator just overrides the $CL.translate() method to add client side translation to
 * the environment. Also an translatePlural()-Method is added to $CL
 *
 * Only the active language is added to js, if you want to switch the language, you can call loadTranslation()
 * and a new language is pulled from the server
 */
$CL.translate = function(transKey) {
    if ($CL.isDefined(window['__TRANSLATIONS__']) && $CL.isDefined(__TRANSLATIONS__[transKey])) {
        return __TRANSLATIONS__[transKey];
    } else {
        return transKey;
    }
};

$CL.translatePlural = function(transKey, count) {
    var transObj = this.translate(transKey);

    if (!_.isObject(transObj)) {
        $CL.exception('Plural translation for key ' + transKey + ' failed. No plural translation found!', 'Cl.Core');
    }

    var index = (count == 1)? 1 : 0;

    return transObj[index];
}

$CL.loadTranslation = function(locale) {
    $CL.exception('loadTranslation is not supported yet', 'Cl.Core');
}