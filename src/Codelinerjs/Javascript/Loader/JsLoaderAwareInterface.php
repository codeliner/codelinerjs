<?php
/**
 * Interface to define that JsLoader is requried
 * 
 * @package JsloaderModule
 * @author Alexander Miertsch <miertsch@codeliner.ws>
 * @copyright (c) 2012, Alexander Miertsch
 */
namespace Codelinerjs\Javascript\Loader;

interface JsLoaderAwareInterface {
    public function setJsLoader(AbstractLoader $jsLoader);
}