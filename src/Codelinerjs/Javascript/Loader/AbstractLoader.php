<?php

/**
 * Abstract Javascript Loader
 *
 * @author Alexander Miertsch kontakt@codeliner.ws
 * @package Cl
 * @subpackage Javascript
 * @version 1.0
 */

namespace Codelinerjs\Javascript\Loader;

use Codelinerjs\Javascript\Exception,
    Zend\ServiceManager\ServiceLocatorInterface,
    Zend\Mvc\MvcEvent,
    Zend\View\Model\ViewModel,
    Zend\I18n\Translator\Translator,
    Zend\View\Resolver\ResolverInterface;

abstract class AbstractLoader {

    const DEFAULT_PREFIX = "Cl";

    protected $_include_path;
    protected $_stage = "production";
    protected $_coreScriptName;
    protected $_coreTmpPath;
    protected $_publicLink;
    protected $_coreMode = "src";
    protected $_internalLoadStack = array();
    protected $_preInitLoadStack = array();
    protected $_postInitLoadStack = array();
    protected $_factories = array();
    protected $_fallbackFactories = array();
    protected $_nonSharedServices = array();
    protected $_coreAppVars = array();
    protected $_appVars = array();
    protected $_userVars = array();
    protected $_loadedClasses = array();
    protected $_enabled = true;
    protected $translator;
    protected $useClientTranslation = false;
    protected $templateParsers = array();
    protected $cachePath = 'data';
    protected $cacheLoadedClasses = false;
    protected $cacheFilename;

    /**
     *
     * @var ResolverInterface
     */
    protected $viewResolver;
    protected $templates = array();

    /**
     *
     * @var Locator
     */
    protected $locator;

    /**
     *
     * @var MvcEvent
     */
    protected $mvcEvent;

    /**
     *
     * @var Request
     */
    protected $request;

    protected $_environment = '$CL';

    public function loadDefaultPath() {
        $this->_include_path[self::DEFAULT_PREFIX] = realpath(dirname(__FILE__)) . '/../library';
    }

    public function setStage($stage)
    {
        $this->_stage = $stage;
    }

    public function hasMvcEvent () {
        return $this->mvcEvent instanceof MvcEvent;
    }

    public function setServiceLocator(ServiceLocatorInterface $locator) {
        $this->locator = $locator;
    }

    public function setTranslator (Translator $translator) {
        $this->translator = $translator;
    }

    public function getTranslator () {
        return $this->translator;
    }

    public function setUseClientTranslation($useClientTranslation)
    {
        $this->useClientTranslation = (bool)$useClientTranslation;
    }

    public function setViewResolver($viewResolver)
    {
        $this->viewResolver = $viewResolver;
    }

    public function setTemplateParsers($templateParsers)
    {
        $this->templateParsers = $templateParsers;
    }

    public function setCachePath($cachePath)
    {
        $this->cachePath = $cachePath;
    }

    public function setCacheLoadedClasses($cacheLoadedClasses)
    {
        $this->cacheLoadedClasses = $cacheLoadedClasses;
    }

    public function setCacheFilename($cacheFilename)
    {
        $this->cacheFilename = $cacheFilename;
    }

    public function isEnabled() {
        return $this->_enabled;
    }

    public function enable() {
        $this->_enabled = true;
    }

    public function disable() {
        $this->_enabled = false;
    }

    public function reset()
    {
        $this->_internalLoadStack = array();
        $this->_preInitLoadStack = array();
        $this->_postInitLoadStack = array();
        $this->_factories = array();
        $this->_fallbackFactories = array();
        $this->_nonSharedServices = array();
        $this->_coreAppVars = array();
        $this->_appVars = array();
        $this->_userVars = array();
        $this->templates = array();
    }

    public function setIncludePaths (array $includePaths) {
        foreach ($includePaths as $prefix => $path) {
            $this->addIncludePath($prefix, $path);
        }
    }

    public function addIncludePath($prefix, $path) {
        $this->_include_path[$prefix] = $path;
    }

    public function onMvcDispatch (MvcEvent $e) {
        $this->mvcEvent = $e;
    }

    public function loadClass($className, $varArr = null, $fileCheck = true) {
        if (empty($this->_include_path))
            throw new Exception("no includePath given");

        $filePath = "";
        foreach ($this->_include_path as $prefix => $path) {
            $matches = array();
            if (preg_match("/^" . $prefix . "\.([\w\d_\-\.]+)$/", $className, $matches)) {
                $filePath = $path . "/" . $this->getRelativPathFromNamespace($matches[1]);
                break;
            }
        }

        if ($filePath == "") {
            throw new Exception("class $className not found in " . $this->includePathToString());
        }

        if (file_exists($filePath)) {
            $classContent = file_get_contents($filePath);
        } else {
            $classContent = false;
        }

        if ($fileCheck) {
            if ($classContent === false)
                throw new Exception("could not load file for Class: " . $className . "\nFile was not found in pathes: " . $this->includePathToString());
        } else {
            if ($classContent === false)
                $classContent = "";
        }

        return $this->_replaceApplicationVars($classContent, $varArr);
    }

    public function loadCachedClasses()
    {
        $this->_loadedClasses = unserialize(file_get_contents($this->getCacheFilePath()));
    }

    public function loadClassInScriptTag($className, $varArr = null) {
        $scriptContent = $this->loadClass($className, $varArr);

        return $this->_setScriptTag($scriptContent, $className);
    }

    protected function _setRequiredVars() {
        $this->addCoreAppVars(
                array(
                    '$APPLICATION_ENV' => json_encode($this->_stage),
                    '$FACTORIES' => json_encode((object) $this->_factories),
                    '$FALLBACK_FACTORIES' => json_encode($this->_fallbackFactories),
                    '$NON_SHARED_SERVICES' => json_encode($this->_nonSharedServices)
                )
        );
    }

    public function getLoader($loadCore = true) {
        if ($this->_coreScriptName === NULL) {
            if ($this->hasMvcEvent()) {
                $routeMatch = $this->mvcEvent->getRouteMatch();
                if ($routeMatch) {
                    $this->_coreScriptName.= '_' . str_replace('\\', '_', $routeMatch->getParam('controller'));
                    $this->_coreScriptName.= '_' . $routeMatch->getParam('action', 'index');
                }
            } else {
                $this->_coreScriptName = "jsloader";
            }
        }

        if ($loadCore) {
            $init = $this->loadClass(self::DEFAULT_PREFIX . ".Init", $this->_coreAppVars);

            //userVars werden in ein extra inline-Script geladen, da sie unabhänig vom Cache sein müssen
            $userVarsString = 'jQuery(function () {';
            foreach ($this->_userVars as $userKey => $userValue) {
                if ($userKey != '$ACTION')
                    $userVarsString.= $this->_environment . '.vars["' . $userKey . '"] = ' . json_encode($userValue) . ';';
            }

            $stageSetterString = '$CL.setStaging("' . $this->_stage . '");';
            $postInitString = '$CL.loadStack = ' . json_encode($this->_postInitLoadStack) . ';';

            $basePathHelper = $this->locator->get('ViewHelperManager')->get('basepath');

            if ($basePathHelper->__invoke() != "") {
                $indexPhp = "";
                if ($this->hasMvcEvent()) {
                    $uri = $this->mvcEvent->getRequest()->getUri()->toString();
                } else {
                    $uri = $_SERVER['REQUEST_URI'];
                }
                
                if (strpos($uri, 'index.php') !== false) {
                    $indexPhp = '/index.php';
                }
                
                $postInitString.= '$CL.basePath = "' . $basePathHelper->__invoke() . $indexPhp . '";';
            }

            //$CL.init() wird vor dem Controller eingebunden
            $userVarsString.= $stageSetterString . $postInitString . $init;


            //controller wird initialisiert
            if (array_key_exists('$ACTION', $this->_userVars)) {
                $userVarsString.= 'if (typeof ' . $this->_environment . '.controller != "undefined") {';
                $userVarsString.= 'if (typeof ' . $this->_environment . '.controller.' . $this->_userVars['$ACTION'] . 'Action == "function")';
                $userVarsString.= $this->_environment . '.controller.' . $this->_userVars['$ACTION'] . 'Action ()';
                $userVarsString.='}';
            }

            //ende Document ready
            $userVarsString.= '});';

            $userScript = $this->_setScriptTag($userVarsString, "_core_userVars");
        } else {
            $userScript = "";
        }

        $locale = $this->translator->getLocale();

        if (!file_exists($this->_coreTmpPath . "/" . $this->_coreScriptName .'_' . $locale . ".js")
            || $this->_stage == "development") {

            if ($loadCore) {
                $this->_setRequiredVars();

                $core = $this->loadClass(self::DEFAULT_PREFIX . ".Core", $this->_coreAppVars);
            } else {
                $core = "";
            }

            //last class in stack should be added first
            $preInitLoadStack = new \Zend\Stdlib\ArrayStack($this->_preInitLoadStack);

            foreach ($preInitLoadStack as $jsClass) {
                $this->_addToInternalStack($jsClass);
            }

            //add client site translator to override $CL.translate()
            //and add $CL.translatePlural() and $CL.loadTranslation()
            if ($this->useClientTranslation) {
                $this->_addToInternalStack('Cl.Core.Translator');
            }

            $preInitContent = $this->_internalLoadStackToStr();
            if ($this->cacheLoadedClasses) {
                file_put_contents($this->getCacheFilePath(), serialize($this->_loadedClasses));
            }

            switch ($this->_coreMode) {
                case "src":
                    include_once('JSMin.php');
                    //Datei lesend und schreibend öffnen, Zeiger wird an Anfang der Datei gesetzt
                    $fp = fopen($this->_coreTmpPath . "/"
                        . $this->_coreScriptName
                        .'_' . $locale . ".js", "w+");
                    //Datei für exklusiven Schreibzugriff sperren
                    flock($fp, 2);
                    fwrite($fp, \JSMin::minify($core . $preInitContent));
                    //Dateisperre wird wieder aufgehoben
                    flock($fp, 3);
                    fclose($fp);
                    break;
                case "scriptTag":
                    return $this->_setScriptTag($core . $preInitContent, "_Core") . $userScript;
                    break;
                default:
                    throw new \Jsloader\Javascript\Exception("unsupported core mode provided: " . $this->_coreMode);
            }
        }

        $templatesScript = "";

        if ( count($this->templates)
            && ((!file_exists($this->_coreTmpPath . '/' . $this->_coreScriptName . '_templates_' . $locale . '.js') )
            || $this->_stage == "development"))
        {
            $fp = fopen($this->_coreTmpPath . "/" . $this->_coreScriptName . "_templates_" . $locale . ".js", "w+");
            //Datei für exklusiven Schreibzugriff sperren
            flock($fp, 2);

            if ($loadCore) {
                $tplStr = '__TEMPLATES__ = {};';
            } else {
                $tplStr = "";
            }


            foreach ($this->templates as $key => $tpl) {

                $tplPath = $this->viewResolver->resolve($tpl);

                if ($tplPath) {
                    $tpl = file_get_contents($tplPath);
                }


                foreach ($this->templateParsers as $parserKey) {
                    $parser = $this->locator->get($parserKey);

                    $tpl = $parser->parse($tpl);
                }


                $tplStr.= '__TEMPLATES__["'.$key.'"] = ' . json_encode($tpl) . ';';
            }

            fwrite($fp, $tplStr);

            //Dateisperre wird wieder aufgehoben
            flock($fp, 3);
            fclose($fp);
        }

        if (count($this->templates)) {
            $templatesScript = $this->_setScriptSrc($this->_coreScriptName . '_templates_' . $locale . '.js', "_templates");
        }

        if ($this->useClientTranslation && $loadCore
            && (!file_exists($this->_coreTmpPath . '/' . $this->_coreScriptName . '_translations_' . $locale . '.js')
            || $this->_stage == "development"))
        {

            $translationStr = '__TRANSLATIONS__ = ' . json_encode($this->getTranslator()->getMessages('default', $locale));

            $fp = fopen($this->_coreTmpPath . "/" . $this->_coreScriptName . "_translations_" . $locale . ".js", "w+");

            //Datei für exklusiven Schreibzugriff sperren
            flock($fp, 2);

            fwrite($fp, $translationStr);

            //Dateisperre wird wieder aufgehoben
            flock($fp, 3);
            fclose($fp);
        } else {
            $translationStr = "";
        }

        $translationsScript = "";

        if ($this->useClientTranslation && $loadCore) {
            $translationsScript = $this->_setScriptSrc($this->_coreScriptName . '_translations_' . $locale . '.js', "_translations");
        }

        return $templatesScript . $translationsScript . $this->_setScriptSrc(
            $this->_coreScriptName .'_' . $locale .  ".js", "_Core"
            )
            . $userScript;
    }

    public function loadModule($name, $config)
    {
        $this->reset();
        $this->loadCachedClasses();

        $locale = $this->translator->getLocale();

        $this->setCoreMode('src');
        $this->setCoreScriptName($this->_coreScriptName . '_' . $name);

        if (isset($config['includePaths'])) {
            foreach ($config['includePaths'] as $namespace => $path) {
                $this->_include_path[$namespace] = $path;
            }
        }

        if (isset($config['template_parsers'])) {
            foreach ($config['template_parsers'] as $templateParser) {
                $this->templateParsers[] = $templateParser;
            }
        }

        if (isset($config['preInitLoadStack']))
            $this->setPreInitLoadStack($config['preInitLoadStack']);
        if (isset($config['postInitLoadStack']))
            $this->setPostInitLoadStack($config['postInitLoadStack']);
        if (isset($config['appVars']))
            $this->addAppVars($config['appVars']);
        if (isset($config['templates']))
            $this->setTemplates($config['templates']);

        $this->getLoader(false);

        if (count($this->templates)) {
            $templates = file_get_contents($this->_coreTmpPath . "/" . $this->_coreScriptName . "_templates_" . $locale . ".js");
        } else {
            $templates = "";
        }

        $classes = file_get_contents($this->_coreTmpPath . "/" . $this->_coreScriptName .'_' . $locale . ".js");

        return $templates . $classes;
    }

    public function setCoreScriptName($coreScriptName) {
        $this->_coreScriptName = str_replace("/", "_", $coreScriptName);
        return $this;
    }

    public function resetCoreScriptName () {
        $this->_coreScriptName = null;
    }

    public function setCoreTmpPath($coreTmpPath) {
        $this->_coreTmpPath = $coreTmpPath;
    }

    public function setPublicLink($publicLink) {
        $this->_publicLink = $publicLink;
    }

    public function setCoreMode($coreMode) {
        $this->_coreMode = $coreMode;
    }

    public function setPreInitLoadStack (array $preInitLoadStack) {
        $this->_preInitLoadStack = $preInitLoadStack;

        return $this;
    }

    public function prependPreInitLoadStack(array $prependPreInitLoadStack) {
        foreach ($this->_preInitLoadStack as $cl) {
            if (!in_array($cl, $prependPreInitLoadStack))
                $prependPreInitLoadStack[] = $cl;
        }

        $this->_preInitLoadStack = $prependPreInitLoadStack;

        return $this;
    }

    public function appendPreInitLoadStack(array $appendPreInitLoadStack) {
        foreach ($appendPreInitLoadStack as $cl) {
            if (!in_array($cl, $this->_preInitLoadStack))
                $this->_preInitLoadStack[] = $cl;
        }

        return $this;

    }

    public function setPostInitLoadStack (array $postInitLoadStack) {
        $this->_postInitLoadStack = $postInitLoadStack;

        return $this;
    }

    public function prependPostInitLoadStack(array $prependPostInitLoadStack) {
        foreach ($this->_postInitLoadStack as $objName => $cl) {
            $prependPostInitLoadStack[$objName] = $cl;
        }
        $this->_postInitLoadStack = $prependPostInitLoadStack;

        return $this;
    }

    public function appendPostInitLoadStack(array $appendPostInitLoadStack) {
        foreach ($appendPostInitLoadStack as $objName => $cl) {
            $this->_postInitLoadStack[$objName] = $cl;
        }

        return $this;
    }

    public function resetCoreAppVars() {
        $this->_coreAppVars = array();
    }

    public function addCoreAppVars(array $coreAppVars) {
        $this->_coreAppVars += $coreAppVars;
    }

    public function setCoreAppVars (array $coreAppVars) {
        $this->_coreAppVars = $coreAppVars;
    }

    public function addAppVars(array $appVars) {

        foreach ($appVars as $key => $value) {
            $this->_appVars[$key] = json_encode($value);
        }

        return $this;
    }

    public function setAppVars (array $appVars) {
        $this->_appVars = $appVars;

        return $this;
    }

    public function addUserVars(array $userVars) {
        $this->_userVars += $userVars;

        return $this;
    }

    public function addTemplate($key, $tpl) {
        $this->templates[$key] = $tpl;

        return $this;
    }

    public function setTemplates(array $templates) {
        $this->templates = $templates;

        return $this;
    }

    public function setUserVars (array $userVars) {
        $this->_userVars = $userVars;

        return $this;
    }

    public function setFactories(array $factories) {
        $this->_factories = $factories;
        return $this;
    }

    public function setFallbackFactories(array $fallbacks) {
        $this->_fallbackFactories = $fallbacks;
        return $this;
    }

    public function setNonSharedServices(array $nonSharedServices) {
        $this->_nonSharedServices = $nonSharedServices;
        return $this;
    }

    public function prepareJsTemplateString($content) {
        return $content;
    }

    protected function _config2str($config) {
        return serialize($config);
    }

    protected function _str2config($configStr) {
        return unserialize($configStr);
    }

    protected function _replaceApplicationVars($jsContent, $varArr = null) {

        $appVars = (null !== $varArr) ? $varArr : $this->_appVars;
        if (count($appVars) > 0) {
            foreach ($appVars as $var => $value) {
                $suchArr[] = $this->_prepaireRegEx($var);
                $replArr[] = $value;
            }

            $jsContent = preg_replace($suchArr, $replArr, $jsContent);
        }



        return $this->_checkTranslation($jsContent);
    }

    protected function _prepaireRegEx($value) {
        $value = str_replace('$', '\$', $value);

        return "/" . $value . "/";
    }

    protected function _getRegExEnv() {
        return str_replace("$", "\\$", '$CL');
    }

    protected function _checkTranslation ($jsContent) {

        if ($this->useClientTranslation) {
            return $jsContent;
        }

        $matches = array();

        preg_match_all('/(?:\\$CL)\\.translate\\(["|\'](.+)["|\']\\)/', $jsContent, $matches);
        if (!empty($matches[1])) {

            foreach ($matches[1] as $key) {
                $translatedValue = $this->getTranslator()->translate($key);
                $jsContent = preg_replace(
                        '/(?:(?:\\$CL)|(?:'
                        . $this->_getRegExEnv()
                        . '))\\.translate\\(["|\']'
                        . preg_quote($key)
                        .'["|\']\\)/',
                        $this->_environment
                        . '.translate("'
                        .str_replace('"', '\"', $translatedValue)
                        .'")',
                        $jsContent);
            }


        }

        return $jsContent;
    }

    protected function getRelativPathFromNamespace($namespace) {
        $ns = trim($namespace, ".");

        if ($ns == "")
            throw new Webs_Javascript_Exception("class $namespace not found in " . $this->includePathToString());

        return str_replace(".", "/", $ns) . ".js";
    }

    protected function getCacheFilePath()
    {
        $cacheFilename = (is_null($this->cacheFilename))? $this->_coreScriptName : $this->cacheFilename;
        return $this->cachePath . '/' . $cacheFilename;
    }

    protected function includePathToString() {
        if (empty($this->_include_path))
            return "";

        return implode(";", $this->_include_path);
    }

    protected function _setScriptTag($jsContent, $className) {
        return sprintf("<script type=\"text/javascript\" id=\"script_%s\"><!--\n%s\n--></script>", $className, $jsContent);
    }

    protected function _setScriptSrc($src, $className) {
        $basePathHelper = $this->locator->get('ViewHelperManager')->get('basepath');
        return "<script type=\"text/javascript\" src=\"" . $basePathHelper->__invoke($this->_publicLink . '/' .$src) . "\" id=\"script_" . $className . "\"></script>";
    }

    protected function _addToInternalStack($className) {
        $classContent = $this->loadClass($className, null);

        $requiredClasses = new \Zend\Stdlib\ArrayStack($this->_getRequiredClasses($classContent));

        foreach ($requiredClasses as $requiredClass) {
            $this->_addToInternalStack($requiredClass);
        }

        if (!in_array($className, $this->_loadedClasses)) {
            $this->_appendInternalStack(array($className => $classContent));
            $this->_loadedClasses[] = $className;
        }

        $internalArray = array();

        foreach ($this->_internalLoadStack as $stackPiece) {
            foreach ($stackPiece as $pieceClass => $pieceContent) {
                $internalArray[] = $pieceClass;
            }

        }
    }

    protected function _getRequiredClasses($classContent) {
        preg_match_all('/(?:\\$CL)\\.require\\(["|\'](.+)["|\']\\)/', $classContent, $matches);
        if (!empty($matches[1])) {
            $requiredArr = $matches[1];

            $filteredRequiredClasses = array();

            foreach($requiredArr as $requiredClass) {
                if (!in_array($requiredClass, $this->_loadedClasses)) {
                    $filteredRequiredClasses[] = $requiredClass;
                }
            }

            return $filteredRequiredClasses;
        } else {
            return array();
        }
    }

    protected function _appendInternalStack($classArr) {
        $this->_internalLoadStack[] = $classArr;
    }

    protected function _prependInternalStack($classArr) {
        $retArr[] = $classArr;

        foreach ($this->_internalLoadStack as $stackPiece) {
            $retArr[] = $stackPiece;
        }

        $this->_internalLoadStack = $retArr;
    }

    protected function _internalLoadStackToStr() {
        $content = "";
        foreach ($this->_internalLoadStack as $stackPiece) {
            foreach ($stackPiece as $className => $classContent) {
                $content.= $classContent . "\n";
            }
        }

        return $content;
    }
}